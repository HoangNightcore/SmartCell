import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';

/**
 * AUTH CONTROLLER - TỔNG ĐÀI ĐIỀU HƯỚNG XÁC THỰC & BẢO MẬT
 * ===================================================================
 * * 1. CÔNG DỤNG:
 * - Tiếp nhận các yêu cầu HTTP (POST, GET) liên quan đến định danh người dùng.
 * - Phối hợp Guard để chặn/mở các tuyến đường (Đăng nhập thì mở, Đăng xuất thì khóa).
 * - Không xử lý logic nghiệp vụ, chỉ làm nhiệm vụ nhận data, gọi Service và trả kết quả.
 * * 2. CÁC API CUNG CẤP:
 * - POST /auth/login    : Đăng nhập truyền thống (Email + Password) -> Trả về cặp Token.
 * - POST /auth/register : Đăng ký tài khoản mới.
 * - POST /auth/refresh  : Đổi Access Token mới bằng Refresh Token cũ.
 * - POST /auth/logout   : Đăng xuất, hủy bỏ hiệu lực của Token.
 * - GET  /auth/profile  : Lấy thông tin cá nhân của người đang đăng nhập.
 * ===================================================================
 */
@Controller('auth') // Tiền tố cố định cho tất cả các API bên dưới (ví dụ: localhost:3000/auth)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 1. API ĐĂNG NHẬP: POST /auth/login
   * - @Public(): Cho phép mọi người truy cập tự do mà không cần Token JWT.
   * - @UseGuards(LocalAuthGuard): Kích hoạt check mật khẩu trong DB trước khi cho vào hàm.
   * - @HttpCode(HttpStatus.OK): Đổi mã trả về từ mặc định 211 (Created) thành 200 (OK).
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUser() user: UserResponseDto, // Nhặt nhanh thông tin User xịn vừa được LocalStrategy xác thực xong
    @Body() loginDto: LoginDto, // Nhận và validate dữ liệu thô gửi lên từ body
  ) {
    // Đã check mật khẩu xong ở Guard, giờ chỉ việc đưa user cho service ký tạo Token mang về
    return this.authService.login(user);
  }

  /**
   * 2. API ĐĂNG KÝ: POST /auth/register
   * - @Public(): Khách vãng lai chưa có tài khoản phải vào được API này.
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 3. API ĐỔI TOKEN MỚI: POST /auth/refresh
   * - Khi Access Token hết hạn, Frontend gửi âm thầm Refresh Token lên đây để lấy cặp Token mới
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  /**
   * 4. API ĐĂNG XUẤT: POST /auth/logout
   * - @UseGuards(JwtAuthGuard): Phải đăng nhập rồi thì mới được đăng xuất.
   * - @HttpCode(HttpStatus.NO_CONTENT): Trả về mã 204 (Thành công nhưng không trả về dữ liệu gì thêm).
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: UserResponseDto, // Lấy ID của người đang yêu cầu đăng xuất
    @Body() refreshTokenDto: RefreshTokenDto, // Lấy token phụ lên để xóa bỏ/vô hiệu hóa dưới DB
  ) {
    await this.authService.logout(user.id, refreshTokenDto.refreshToken);
  }

  /**
   * 5. API LẤY THÔNG TIN CÁ NHÂN: GET /auth/profile
   * - @UseGuards(JwtAuthGuard): Phải đính kèm Token JWT hợp lệ ở Header mới xem được.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: UserResponseDto) {
    // Nhờ có JwtAuthGuard đi trước, @CurrentUser chỉ cần nhặt data có sẵn trả về luôn,
    // không cần phải tốn thêm một lượt truy vấn chạy vào Database nữa.
    return user;
  }
}
