import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * LOCAL AUTH GUARD: Bộ lọc gác cổng cho API Đăng nhập bằng Password truyền thống.
 * * TÁC DỤNG TỔNG QUAN:
 * - Sử dụng chiến lược 'local' (LocalStrategy) để kiểm tra cặp `username` và `password` do Client gửi lên.
 * - Chỉ được sử dụng DUY NHẤT tại API Đăng nhập (`POST /auth/login`).
 * * CÁCH DÙNG TRONG CONTROLLER:
 * @Post('login')
 * @UseGuards(LocalAuthGuard) // <-- Gắn vào đây, người dùng truyền sai mật khẩu sẽ bị chặn lại ngay lập tức
 * async login(@Req() req) {
 * return this.authService.login(req.user); // Nếu vào được đến đây, chắc chắn mật khẩu đã đúng
 * }
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
// Mặc dù bên trong class này trống rỗng `{}`, nhưng khi NestJS thực thi,
// nó sẽ tự động kích hoạt file `local.strategy.ts` (nơi chứa logic so sánh mật khẩu với Database).
