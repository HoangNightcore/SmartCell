import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * STRATEGY XÁC THỰC CỤC BỘ: LocalStrategy (Passport)
 * * * TÁC DỤNG TỔNG QUAN:
 * - Định nghĩa "Chiến lược" kiểm tra thông tin đăng nhập truyền thống (Email & Mật khẩu).
 * - Đóng vai trò là "Cỗ máy xử lý" chạy ngầm phía sau của `LocalAuthGuard`.
 * - Tách biệt hoàn toàn phần logic "trích xuất dữ liệu từ HTTP Request" ra khỏi logic "kiểm tra DB".
 * * * VỊ TRÍ TRONG LUỒNG ĐĂNG NHẬP (Authentication Flow):
 * Client (Gửi Body) ──> LocalAuthGuard ──(Kích hoạt)──> LocalStrategy
 * │ (Nhặt Email, Password)
 * ▼
 * Controller <──(Trả req.user) <── Thừa nhận xịn <── AuthService (Check DB + Hash)
 * * * KHI NÀO FILE NÀY ĐƯỢC KÍCH HOẠT?
 * - Duy nhất khi Client gọi API Đăng nhập và API đó được gắn `@UseGuards(LocalAuthGuard)`.
 */
@Injectable()
// Kế thừa chiến lược Xác thực cục bộ (Strategy của passport-local) để xử lý đăng nhập truyền thống
export class LocalStrategy extends PassportStrategy(Strategy) {
  // Bơm AuthService vào vì trong AuthService chứa hàm validateUser (nơi trực tiếp so sánh mật khẩu với DB)
  constructor(private authService: AuthService) {
    // Gọi hàm khởi tạo của lớp cha (super) để cấu hình Passport
    super({
      // Mặc định thư viện passport-local sẽ đi tìm trường tên là 'username' trong Body của Request gửi lên.
      // Vì hệ thống của bạn dùng 'email' để đăng nhập thay cho username,
      // dòng dưới này dùng để cấu hình lại: "Hãy tìm trường tên là 'email' ở Body nhé!"
      usernameField: 'email',
      // Lưu ý: Trường mật khẩu mặc định passport tự hiểu là 'password', nên ta không cần cấu hình lại.
    });
  }

  /**
   * HÀM VALIDATE: Hàm cốt lõi tự động chạy khi Client gọi API Đăng nhập.
   * Passport sẽ tự động nhặt trường `email` và `password` từ Body của Request và ném vào 2 tham số dưới này.
   * * @param email Email lấy từ Body Request
   * @param password Mật khẩu trơn lấy từ Body Request
   * @returns Thông tin User xịn nếu đăng nhập thành công
   */
  async validate(email: string, password: string) {
    // Bước 1: Gọi sang AuthService, nhờ hàm `validateUser` kiểm tra xem email có tồn tại không
    // và mật khẩu trơn gửi lên dịch ra có khớp với mật khẩu đã băm (hashed) trong DB không.
    const user = await this.authService.validateUser(email, password);

    // Bước 2: Nếu hàm validateUser trả về null (sai email hoặc sai mật khẩu)
    if (!user) {
      // Chặn đứng tại đây và bắn về lỗi 401 Unauthorized với thông điệp sai thông tin đăng nhập
      // (Lưu ý nhỏ: Chữ 'creadentials' đang bị viết dư chữ 'a', bạn có thể sửa lại thành 'credentials' cho chuẩn nhé)
      throw new UnauthorizedException('Invalid creadentials');
    }

    // Bước 3: Nếu tài khoản mật khẩu chuẩn đét, trả về object user.
    // Toàn bộ object user này sẽ được NestJS tự động đính vào `req.user` ở hàm login trong Controller.
    return user;
  }
}
