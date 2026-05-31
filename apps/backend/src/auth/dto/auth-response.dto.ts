import { UserResponseDto } from './../../users/dto/user-response.dto';

/**
 * AUTH RESPONSE DTO: Cấu trúc dữ liệu trả về khi Đăng nhập / Đăng ký thành công.
 * * TÁC DỤNG TỔNG QUAN:
 * - Định hình và chuẩn hóa dữ liệu phản hồi (Response) từ API Auth về phía Client.
 * - Cung cấp đầy đủ cả thông tin cá nhân (User) lẫn bộ đôi chìa khóa (Access Token & Refresh Token)
 * để Frontend lưu lại và dùng cho các request tiếp theo.
 */
export class AuthResponseDto {
  // 1. Thông tin chi tiết của người dùng vừa đăng nhập.
  // Nhờ dùng UserResponseDto, các thông tin nhạy cảm như passwordHash đã được lọc sạch sẽ trước khi bỏ vào đây.
  user: UserResponseDto;

  // 2. Mã token chính (Thường có hạn ngắn, ví dụ: 15 phút).
  // Frontend sẽ cầm mã này đính vào Header của mọi API sau đó để chứng minh mình đã đăng nhập.
  // (Lưu ý nhỏ: Thuộc tính này đang bị dư 1 chữ 's' ở chữ accesssToken, bạn có thể sửa lại cho chuẩn nhé).
  accesssToken: string;

  // 3. Mã token phụ (Thường có hạn dài, ví dụ: 7 ngày).
  // Dùng để bí mật đổi lấy Access Token mới khi Access Token cũ bị hết hạn.
  refreshToken: string;

  // 4. Định dạng của Token.
  // Gán mặc định bằng 'Bearer' theo chuẩn bảo mật OAuth 2.0 / JWT quốc tế.
  tokenType: string = 'Bearer';

  // 5. Thời gian sống của Access Token (Tính bằng giây hoặc mili-giây, ví dụ: 3600 giây = 1 tiếng).
  // Giúp Frontend biết chính xác khi nào Token sẽ hết hạn để chủ động gọi API Refresh Token trước.
  expiresIn: number;

  /**
   * HÀM KHỞI TẠO (CONSTRUCTOR):
   * Ép lập trình viên khi gọi `new AuthResponseDto(...)` ở tầng Service hoặc Controller
   * phải truyền đầy đủ và chính xác các tham số này vào để đóng gói dữ liệu.
   */
  constructor(
    user: UserResponseDto,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) {
    this.user = user;
    this.accesssToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
  }
}
