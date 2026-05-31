import { IsString } from 'class-validator';

/**
 * REFRESH TOKEN DTO: Định hình dữ liệu Client gửi lên để gia hạn đăng nhập.
 * * TÁC DỤNG TỔNG QUAN:
 * - Dùng để bắt lỗi và kiểm tra tính hợp lệ (Validation) của dữ liệu đầu vào tại API `/auth/refresh`.
 * - Đảm bảo Client gửi đúng và đủ chuỗi mã Token phụ, bảo vệ hệ thống khỏi dữ liệu rác.
 */
export class RefreshTokenDto {
  // 1. Kiểm tra dữ liệu: Bắt buộc Client phải truyền lên trường này và giá trị của nó phải là một chuỗi ký tự (String).
  // Nếu Client gửi thiếu, gửi sai tên trường, hoặc gửi sai kiểu (ví dụ gửi một số 123 hay một mảng []),
  // NestJS sẽ lập tức chặn lại và trả về lỗi 400 Bad Request ngay tại cửa cửa Controller.
  @IsString({ message: 'Refresh token phải là một chuỗi ký tự hợp lệ' })

  // 2. Ký tự `!:` (Definite Assignment Assertion) trong TypeScript:
  // Vì chế độ kiểm tra nghiêm ngặt của TS bắt buộc biến phải có giá trị ngay khi khai báo.
  // Dấu chấm than này báo hiệu cho TS hiểu: "Yên tâm đi, lúc khởi tạo class biến này chưa có giá trị,
  // nhưng lúc ứng dụng chạy thật, NestJS sẽ tự động đổ dữ liệu từ Request của khách hàng vào đây, đừng báo lỗi đỏ!"
  refreshToken!: string;
}
