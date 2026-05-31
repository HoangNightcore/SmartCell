import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { User } from '@prisma/client';

/**
 * ĐỊNH NGHĨA INTERFACE MỞ RỘNG:
 * Mặc định, object Request của Express không biết thuộc tính `user` có cấu trúc thế nào.
 * Dòng này giúp ép kiểu để TypeScript hiểu rằng `request.user` chính là Model User lấy từ Prisma,
 * từ đó giúp gõ `user.role` mà không bị báo lỗi đỏ.
 */
interface RequestWithUser extends Request {
  user: User;
}

/**
 * BỘ LỌC PHÂN QUYỀN TRUY CẬP: RolesGuard (Authorization Guard)
 * * * 1. TÁC DỤNG TỔNG QUAN:
 * - Đóng vai trò là "Trưởng phòng kiểm tra cấp bậc" của hệ thống Backend.
 * - Chịu trách nhiệm thực thi việc PHÂN QUYỀN (Authorization) - xác định xem một người dùng
 * đã đăng nhập (Authenticated) có đủ thẩm quyền/chức vụ để kích hoạt một API cụ thể hay không.
 * - Ngăn chặn triệt để tình trạng User thường cố tình gọi các API của Admin (như xóa dữ liệu, xem doanh thu).
 * * * 2. CÁCH DÙNG TRONG CONTROLLER:
 * - Bước 1: Dán nhãn quyền bằng decorator `@Roles('tên_quyền')` lên đầu API hoặc đầu Controller.
 * - Bước 2: Kích hoạt Guard bằng cách thêm `RolesGuard` vào `@UseGuards()`.
 * * * * Ví dụ thực tế:
 * @Get('admin/dashboard')
 * @Roles('admin', 'manager')         // <-- Chỉ Admin hoặc Manager mới được phép xem
 * @UseGuards(JwtAuthGuard, RolesGuard) // <-- BẮT BUỘC xếp RolesGuard ĐỨNG SAU JwtAuthGuard
 * getAdminStats() { ... }
 * * * 3. ĐIỀU KIỆN ĐỂ GUARD NÀY HOẠT ĐỘNG ĐÚNG:
 * - Hệ thống bắt buộc phải chạy `JwtAuthGuard` trước để giải mã Token và nạp thông tin vào `request.user`.
 * - Nếu không có `JwtAuthGuard` đi trước, `request.user` sẽ bị `undefined` và Guard này sẽ bị crash.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Bơm Reflector vào để có thể đọc được cái "nhãn" @Roles(['admin']) gắn ở các Controller
  constructor(private reflector: Reflector) {}

  /**
   * HÀM CAN_ACTIVATE: Quyết định xem User có đủ quyền hạn để vào API hay không.
   * Trả về `true` = Cho qua, trả về `false` = Chặn lại và tự động bắn lỗi 403 Forbidden.
   */
  canActivate(context: ExecutionContext): boolean {
    // Bước 1: Quét xem API hiện tại (getHandler) hoặc toàn bộ Controller (getClass)
    // có yêu cầu những quyền truy cập cụ thể nào không (Đọc từ nhãn ROLES_KEY).
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Bước 2: KIỂM TRA XEM API CÓ YÊU CẦU PHÂN QUYỀN KHÔNG
    // Nếu API này không dán nhãn @Roles(...) (requiredRoles là undefined),
    // nghĩa là API này ai đăng nhập rồi cũng vào được => Cho qua luôn (return true).
    if (!requiredRoles) {
      return true;
    }

    // Bước 3: Lấy thông tin User ra khỏi Request Object.
    // Lưu ý: Để dòng này chạy đúng, RolesGuard bắt buộc phải xếp sau JwtAuthGuard.
    // Vì phải có JwtAuthGuard đi trước giải mã Token thì mới có cục `user` nằm trong Request này.
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    // Bước 4: SO SÁNH QUYỀN HẠN
    // Hàm .some() sẽ duyệt qua danh sách các quyền được phép vào API (requiredRoles).
    // Chỉ cần quyền hiện tại của User (user.role) trùng với MỘT TRONG CÁC QUYỀN yêu cầu,
    // hàm sẽ trả về `true` (Cho phép truy cập). Nếu duyệt hết mà không khớp quyền nào, trả về `false` (Chặn đứng).
    return requiredRoles.some((role) => user.role === role);
  }
}
