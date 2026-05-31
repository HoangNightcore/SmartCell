import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * CUSTOM PARAM DECORATOR: @CurrentUser
 * * TÁC DỤNG TỔNG QUAN:
 * - Dùng để "nhặt" nhanh thông tin của người dùng đang đăng nhập hiện tại ra khỏi Request object.
 * - Thường được sử dụng ở tầng Controller ngay sau khi các API đã đi qua bộ lọc xác thực (JwtAuthGuard).
 * - Giúp code Controller ngắn gọn, tăng tính tái sử dụng và dễ dàng viết Unit Test hơn.
 * * CÁCH DÙNG TRONG CONTROLLER:
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: any) {  <-- Chỉ cần gọi như thế này là có data
 * return user;
 * }
 */

export const CurrentUser = createParamDecorator(
  // Hàm factory nhận vào 2 tham số:
  // - data: Dữ liệu truyền vào decorator nếu có (ví dụ: @CurrentUser('email') thì data sẽ là 'email')
  // - ctx: ExecutionContext (Ngữ cảnh thực thi) chứa toàn bộ thông tin về Request hiện tại
  (data: unknown, ctx: ExecutionContext) => {
    // 1. Chuyển đổi ngữ cảnh thực thi (ctx) sang môi trường HTTP.
    // Vì NestJS có thể chạy cả Websocket, Microservices, GraphQL...
    // Dòng này giúp ép cấu trúc về giao thức HTTP thuần túy để làm việc với Request/Response.
    const httpContext = ctx.switchToHttp();

    // 2. Lấy ra object Request của Express từ trong ngữ cảnh HTTP đó.
    // Ép kiểu <Request> từ thư viện 'express' để có đầy đủ gợi ý gõ mã (IntelliSense).
    const request = httpContext.getRequest<Request>();

    // 3. Trả về thuộc tính `user` nằm bên trong Request.
    // Lưu ý: Thuộc tính `user` này có được là nhờ `JwtStrategy` trước đó đã xác thực token thành công
    // và âm thầm đính kèm vào (request.user = user). Nếu API không dùng Guard, dòng này sẽ trả về undefined.
    return request.user;
  },
);
