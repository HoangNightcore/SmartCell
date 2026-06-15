import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/response/user-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import Redis from 'ioredis';
/**
 * AUTH SERVICE - TRUNG TÂM XỬ LÝ LOGIC BẢO MẬT & KÝ TOKEN
 * ===================================================================
 * 1. TÁC DỤNG TỔNG QUAN:
 * - Chứa toàn bộ logic nghiệp vụ liên quan đến xác thực và bảo mật hệ thống.
 * - Trực tiếp mã hóa thông tin người dùng để ký tạo chuỗi JWT (Access/Refresh Token).
 * - Quản lý vòng đời Token: Tạo mới (Login/Register), Gia hạn (Refresh), Hủy bỏ (Logout).
 * - Điều phối dữ liệu giữa tầng mã hóa (JwtService) và tầng dữ liệu (UsersService/Prisma).
 * ===================================================================
 */
@Injectable()
export class AuthService {
  private redisClient: Redis;
  constructor(
    private userService: UsersService, // Bơm vào để dùng các hàm check DB, cập nhật thông tin user
    private jwtService: JwtService, // Bơm thư viện JWT của NestJS để ký/xác thực chuỗi token
    private configService: ConfigService, // Bơm vào để lấy các biến môi trường cấu hình thời gian hết hạn (.env)
    private prisma: PrismaService, // Bơm Prisma để sẵn sàng tương tác DB (như lưu refresh token)
  ) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);
  }

  /**
   * 1. XÁC THỰC MẬT KHẨU: Được gọi ngầm bởi LocalStrategy khi có request đăng nhập.
   * Chuyển tiếp email/password sang UsersService để so sánh với mật khẩu băm trong DB.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    return this.userService.validatePassword(email, password);
  }

  /**
   * 2. LOGIC ĐĂNG NHẬP: Tạo chuỗi token, ghi nhận thời gian và đóng gói dữ liệu trả về.
   */
  async login(user: UserResponseDto): Promise<AuthResponseDto> {
    // Bước A: Tạo ra bộ đôi song sát Access Token & Refresh Token cho User này
    const tokens = await this.generateTokens(user);

    // Update last login
    // Bước B: Cập nhật lại thời gian đăng nhập cuối cùng của người dùng dưới DB
    await this.userService.updateLastLogin(user.id);

    // Store refresh token (optional: in database)
    // Bước C: Lưu Refresh Token mới sinh vào thẳng RAM của Redis thay vì PostgreSQL
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Bước D: Đóng gói toàn bộ "quà tặng" vào AuthResponseDto để trả về cho Client
    return new AuthResponseDto(
      user,
      tokens.accessToken,
      tokens.refreshToken,
      this.getTokenExpiry(), // Tính số giây hết hạn để báo cho Frontend biết
    );
  }

  /**
   * 3. LOGIC ĐĂNG KÝ TÀI KHOẢN MỚI
   * Gọi UsersService để tạo bản ghi mới trong DB, sau đó cho người dùng đăng nhập luôn lập tức.
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.create(registerDto);
    return this.login(user); // Đăng ký xong tự động kích hoạt hàm login bên trên để cấp Token luôn
  }

  /**
   * 4. LOGIC GIA HẠN ĐĂNG NHẬP (REFRESH TOKEN)
   * Client nộp Refresh Token cũ lên để đổi lấy bộ Token hoàn toàn mới mà không cần gõ lại password.
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Bước A: Dùng JwtService giải mã mã xem Refresh Token này có hợp lệ và còn hạn không
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Bước B: Tìm kiếm User theo ID (sub) đúc từ trong token ra
      const user = await this.userService.findById(payload.sub);

      // Verify stored refresh token (if using database storage)
      // Bước C: Đối chiếu Refresh Token này xem có nằm trong "Whitelist" của Redis không
      const isValidRefreshToken = await this.verifyRefreshToken(
        user.id,
        refreshToken,
      );

      // Nếu không khớp (Token giả hoặc Token cũ đã đăng xuất), chặn ngay lập tức
      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Bước D: ÁP DỤNG XOAY VÒNG TOKEN (TOKEN ROTATION) BẢO MẬT CAO
      // Xóa ngay lập tức token cũ trong Redis để ngăn chặn hacker lấy trộm và dùng lại lần thứ 2
      await this.removeRefreshToken(user.id, refreshToken);

      // Bước E: Nếu mọi thứ chuẩn đét, thu hồi Token cũ, phát hành cặp Token hoàn toàn mới
      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken); // Ghi nhận Token mới vào Redis

      return new AuthResponseDto(
        user,
        tokens.accessToken,
        tokens.refreshToken,
        this.getTokenExpiry(),
      );
    } catch {
      // Bắt mọi lỗi hết hạn token hoặc mã hóa sai và đẩy về lỗi 401
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * 5. LOGIC ĐĂNG XUẤT
   * Tiếp nhận lệnh từ Controller, lội vào DB xóa bỏ Refresh Token để vô hiệu hóa chuỗi mã này.
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    // Gọi hàm xóa token khỏi Redis để vô hiệu hóa phiên làm việc ngay lập tức
    await this.removeRefreshToken(userId, refreshToken);
  }

  /**
   * ===================================================================
   * CÁC HÀM BỔ TRỢ CHẠY NỘI BỘ (PRIVATE METHODS)
   * ===================================================================
   */

  /**
   * HÀM TẠO TOKEN: Ký mã hóa các thông tin id, email, role thành 2 chuỗi JWT riêng biệt.
   */
  private async generateTokens(user: UserResponseDto) {
    const payload: JwtPayload = {
      sub: user.id, // ID người dùng dán vào trường 'sub' (Subject) theo chuẩn JWT
      email: user.email,
      role: user.role,
    };

    // Chạy đồng thời (Promise.all) ký cả 2 token cùng lúc để tăng tối đa hiệu năng hệ thống
    const [accessToken, refreshToken] = await Promise.all([
      // Ký Access Token (Hạn ngắn - mặc định 15 phút nếu file .env không cấu hình)
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRY',
          '15m',
        ),
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      // Ký Refresh Token (Hạn dài - mặc định 7 ngày dùng để gia hạn đăng nhập)
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRY',
          '7d',
        ),
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  /**
   * HÀM LƯU REFRESH TOKEN XUỐNG REDIS KÈM THỜI GIAN HẾT HẠN (TTL)
   */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // Thiết lập cấu trúc key: refresh_token:id_user:chuoi_token
    const key = `refresh_token:${userId}:${refreshToken}`;

    // Tự động tính toán số giây hết hạn (TTL) dựa theo cấu hình .env (Ví dụ: '7d' -> số giây)
    const expiryConfig = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRY',
      '7d',
    );
    let ttlInSeconds = 7 * 24 * 60 * 60; // Mặc định 7 ngày

    if (expiryConfig.endsWith('d')) {
      ttlInSeconds = parseInt(expiryConfig) * 24 * 60 * 60;
    }
    if (expiryConfig.endsWith('h')) {
      ttlInSeconds = parseInt(expiryConfig) * 60 * 60;
    }

    // Ghi vào Redis với cờ 'EX' (Expiry) để token tự động bốc hơi khỏi RAM khi hết hạn
    await this.redisClient.set(key, 'true', 'EX', ttlInSeconds);
  }

  /**
   * HÀM KIỂM TRA REFRESH TOKEN TRONG REDIS
   */
  private async verifyRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    // Tìm thử trên Redis xem có Key này không
    const exsists = await this.redisClient.get(key);
    return exsists === 'true';
  }

  /**
   * HÀM XÓA REFRESH TOKEN KHỎI REDIS (KHI LOGOUT HOẶC KHI XOAY VÒNG)
   */
  private async removeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    // Xóa thẳng tay key này khỏi bộ nhớ RAM của redis
    await this.redisClient.del(key);
  }

  /**
   * HÀM TÍNH THỜI GIAN SỐNG CỦA ACCESS TOKEN (Đổi ra đơn vị Giây)
   * Giúp Frontend đọc được dạng số (Ví dụ: '15m' đổi thành 900 giây) để tự làm bộ đếm ngược.
   */
  private getTokenExpiry(): number {
    const expiry = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRY',
      '15m',
    );
    // Convert to seconds (for frontend)
    // Nếu cấu hình là phút (m) -> nhân với 60 giây
    if (expiry.includes('m')) {
      return parseInt(expiry) * 60;
    }
    // Nếu cấu hình là giờ (h) -> nhân với 3600 giây
    if (expiry.includes('h')) {
      return parseInt(expiry) * 3600;
    }
    return 900; // Mặc định trả về 15 phút (900s) nếu config lỗi
  }
}
