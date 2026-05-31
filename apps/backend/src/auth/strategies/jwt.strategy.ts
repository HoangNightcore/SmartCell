import { UsersService } from './../../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Định nghĩa cấu trúc dữ liệu (Payload) được mã hóa bên trong mã JWT.
 * Giúp TypeScript kiểm soát chặt chẽ các trường dữ liệu khi bóc tách từ Token.
 */

export interface JwtPayload {
  sub: string; // ID của User (Subject)
  email: string;
  role: string;
  iat?: number; // Thời điểm phát hành token (Issued At - dạng timestamp)
  exp?: number; // Thời điểm hết hạn token (Expiration Time - dạng timestamp)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // 1. Chỉ định nơi nhặt Token: Lấy từ mục 'Authorization: Bearer <TOKEN>' trong Request Header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. Không cho phép bỏ qua hạn sử dụng: Nếu Token hết hạn, Passport sẽ tự động chặn đứng và báo lỗi 401
      ignoreExpiration: false,

      // 3. Khóa bí mật dùng để giải mã và xác thực tính toàn vẹn của Token.
      // Trong trường hợp file .env lỡ bị thiếu biến JWT_SECRET (giúp code không bị crash) => dùng toán tử || để gán một chuỗi mặc định
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
    });
  }

  /**
   * HÀM VALIDATE: Chạy TỰ ĐỘNG đằng sau sau khi Passport đã xác thực Token xịn và còn hạn.
   * Nhiệm vụ: Kiểm tra trạng thái thực tế của User trong Database và chuẩn bị dữ liệu gán vào `req.user`.
   *
   * @param payload Cục dữ liệu đã được giải mã từ Token
   * @returns Dữ liệu User xịn từ DB để NestJS tự động nạp vào object Request (req.user)
   */

  async validate(payload: JwtPayload) {
    try {
      // Bước 1: Dùng ID (payload.sub) lấy từ token để truy vấn thông tin mới nhất của User trong DB
      const user = await this.usersService.findById(payload.sub);

      // Bước 2: Bảo mật nâng cao - Ngăn chặn trường hợp User vẫn có Token hợp lệ nhưng đã bị Admin khóa tài khoản
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated'); // Bắn lỗi 401: Tài khoản đã bị vô hiệu hóa
      }

      // Bước 3: Trả về Object User xịn. Toàn bộ object này sẽ nằm gọn trong `req.user` ở các Controller phía sau
      return user;
    } catch {
      // Bọc trong try-catch để bắt mọi lỗi phát sinh (không tìm thấy user, lỗi kết nối DB, v.v.)
      // Đảm bảo thông tin lỗi trả về Client luôn là 401 Unauthorized an toàn, không bị lộ lỗi hệ thống (Internal Error)
      throw new UnauthorizedException('Invalid token');
    }
  }
}
