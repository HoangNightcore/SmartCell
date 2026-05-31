import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * THỦ TRƯỞNG ĐỒN GÁC CỔNG BẢO MẬT: JwtAuthGuard
 * * ====================================================================================
 * I. CÔNG DỤNG TỔNG QUAN:
 * ====================================================================================
 * 1. MẶC ĐỊNH KHÓA TOÀN BỘ: Khi được cấu hình làm Global Guard (Bộ lọc toàn cục), ông thần này
 * sẽ tự động khóa chặn 100% tất cả các API trong hệ thống. Hacker hay khách vãng lai không thể
 * vào phá phách nếu không cung cấp một mã Token JWT hợp lệ.
 * * 2. ĐỌC NHÃN MIỄN KIỂM TRÁI PHÉP: Nhờ tích hợp công cụ `Reflector`, Guard này có khả năng "ngó"
 * lên API để xem có bị dán nhãn `@Public()` hay không. Nếu có, nó sẽ tự động né sang một bên
 * để cho khách vào tự do (bypass), giúp người dùng có thể Đăng nhập/Đăng ký mà không bị đòi Token.
 * * 3. ĐÍNH KÈM DANH TÍNH USER: Sau khi phối hợp với `JwtStrategy` giải mã Token thành công, Guard này
 * sẽ chủ động lấy dữ liệu User và nạp thẳng vào bộ nhớ của Request (`request.user`). Nhờ đó,
 * các file đứng sau như `RolesGuard` hay `@CurrentUser()` mới có dữ liệu để làm việc.
 * * ====================================================================================
 * II. CÁCH DÙNG TRONG HỆ THỐNG (Bản chuẩn kiến trúc lớn):
 * ====================================================================================
 * * CÁCH 1: KÍCH HOẠT TOÀN CỤC (Khuyên dùng - Bảo mật tuyệt đối)
 * Khai báo trong file `app.module.ts` hoặc `main.ts` để tất cả API tự động bị gác cổng:
 * * // src/app.module.ts
 * providers: [
 * {
 * provide: APP_GUARD,
 * useClass: JwtAuthGuard, // <--- Kích hoạt bảo vệ toàn bộ dự án!
 * },
 * ]
 * * Khi dùng cách này, những API nào muốn mở cho người ngoài xem (như Đăng nhập, Đăng ký, Xem bài viết),
 * bạn CHỈ CẦN gắn thêm decorator `@Public()` lên đầu API đó là xong:
 * * // src/auth/auth.controller.ts
 * @Post('login')
 * @Public() // <--- "Tấm kim bài miễn tử" báo cho JwtAuthGuard mở cửa cho qua
 * login() { ... }
 * * ------------------------------------------------------------------------------------
 * CÁCH 2: KÍCH HOẠT THEO TỪNG FILE/API LẺ (Cơ chế nới lỏng trước, chặt chẽ sau)
 * Nếu không cấu hình Global ở AppModule, bạn phải tự tay dán Guard này ở những Controller cần bảo mật:
 * * // src/users/users.controller.ts
 * @Controller('users')
 * @UseGuards(JwtAuthGuard) // <--- Chỉ riêng Controller này yêu cầu phải có Token đăng nhập
 * export class UsersController { ... }
 */
@Injectable()
// Kế thừa AuthGuard('jwt') của thư viện Passport để tận dụng tính năng tự động check Token JWT
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Bơm (Inject) Reflector vào constructor.
  // Reflector là một công cụ đặc biệt của NestJS dùng để "đọc" các nhãn Metadata (như nhãn @Public()) gắn trên API.
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * HÀM CAN_ACTIVATE: Hàm quyết định xem một Request có được phép đi tiếp vào Controller hay không.
   * Hàm này tự động chạy MỖI KHI có bất kỳ một request nào gửi đến các API được bảo vệ.
   */
  canActivate(context: ExecutionContext) {
    // Bước 1: Dùng Reflector để quét xem API hiện tại (getHandler) hoặc toàn bộ Class/Controller hiện tại (getClass)
    // có bị dán cái thẻ nhãn tên là 'isPublic' (IS_PUBLIC_KEY) hay không.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Bước 2: KIỂM TRA ĐIỀU KIỆN MIỄN GIẢM VÉ
    // Nếu tìm thấy nhãn @Public() (isPublic === true), lập tức trả về `true` để mở cửa cho qua luôn,
    // bỏ qua toàn bộ việc kiểm tra Token JWT phía sau.
    if (isPublic) {
      return true;
    }

    // Bước 3: Nếu KHÔNG PHẢI API PUBLIC, kích hoạt cơ chế kiểm tra vé thông thường của Passport.
    // Dòng này sẽ gọi ngầm đến `JwtStrategy` để bắt đầu bóc tách và xác thực Token trong Header.
    return super.canActivate(context);
  }

  /**
   * HÀM HANDLE_REQUEST: Hàm xử lý kết quả SAU KHI Passport đã check Token xong xuôi.
   * Nó dùng để quyết định cách hành xử khi có lỗi hoặc khi không tìm thấy thông tin người dùng.
   */
  handleRequest<TUser = any>(
    err: any, // Lỗi hệ thống phát sinh trong quá trình check token (nếu có)
    user: any, // Dữ liệu User xịn trả về từ hàm validate() của JwtStrategy
    info: any, // Thông tin bổ sung (ví dụ: thông báo lỗi "jwt expired" - token hết hạn)
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // Nếu quá trình check token bị lỗi (err) HOẶC không tìm thấy user hợp lệ (!user)
    if (err || !user) {
      // Lập tức ném ra lỗi 401 UnauthorizedException để chặn đứng request và báo cho Client biết.
      throw err || new UnauthorizedException();
    }

    // Nếu token hoàn toàn hợp lệ, trả về object user để NestJS nạp vào `req.user`.
    return user as TUser;
  }
}
