import { SetMetadata } from '@nestjs/common';

/**
 * Định nghĩa một "Từ khóa" (Key) duy nhất để đánh dấu trong hệ thống.
 * Từ khóa này giống như tên của một cái nhãn (Tag) dùng để dán lên các API.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * CUSTOM DECORATOR: @Public()
 * * TÁC DỤNG TỔNG QUAN:
 * - Dùng để đánh dấu một API hoặc toàn bộ một Controller là "Công khai" (Public).
 * - Giúp bypass (vượt qua) bộ lọc bảo mật JwtAuthGuard toàn cục.
 * * * CÁCH DÙNG TRONG CONTROLLER:
 * @Post('login')
 * @Public() // <-- Gắn thẻ này vào thì người chưa đăng nhập mới gọi được API login
 * login(@Body() loginDto: LoginDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// Bản chất hàm SetMetadata(key, value) của NestJS là:
// Đính kèm một mẩu thông tin ngầm { 'isPublic': true } vào hàm/route mà nó đứng trên.
