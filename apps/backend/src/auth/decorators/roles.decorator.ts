import { SetMetadata } from '@nestjs/common';

/**
 * Định nghĩa một "Từ khóa" (Key) duy nhất trong hệ thống.
 * Từ khóa này đóng vai trò là tên của cái nhãn (Tag) dùng để dán lên các API nhằm phân quyền.
 */
export const ROLES_KEY = 'roles';

/**
 * CUSTOM DECORATOR: @Roles(...roles: string[])
 * * TÁC DỤNG TỔNG QUAN:
 * - Dùng để đánh dấu các quyền (Roles) được phép truy cập vào một API cụ thể.
 * - Sử dụng cú pháp Rest Parameters (`...roles`) để bạn có thể truyền vào một hoặc nhiều quyền cùng lúc.
 * * CÁCH DÙNG TRONG CONTROLLER:
 * @Delete('user/:id')
 * @Roles('admin', 'moderator') // <-- Chỉ những User có role là admin hoặc moderator mới được xóa user khác
 * @UseGuards(JwtAuthGuard, RolesGuard) // <-- Cần có RolesGuard đứng sau để đọc cái nhãn này
 * deleteUser(...) { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
// Bản chất: Hàm này nhận vào một mảng các chuỗi (ví dụ: ['admin', 'moderator'])
// Sau đó dùng SetMetadata để đính kèm ngầm mẩu thông tin { 'roles': ['admin', 'moderator'] } vào API đó.
