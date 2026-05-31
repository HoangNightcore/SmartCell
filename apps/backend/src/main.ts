import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BẬT VALIDATION TẦNG TOÀN CỤC Ở ĐÂY
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // (Khuyên dùng) Tự động lọc bỏ các thuộc tính không được khai báo trong DTO
      forbidNonWhitelisted: true, // (Tùy chọn) Sẽ báo lỗi 400 nếu client gửi lên field lạ không có trong DTO
      transform: true, // (Khuyên dùng) Tự động convert kiểu dữ liệu sang đúng kiểu khai báo trong DTO (ví dụ: string "1" thành number 1)
    }),
  );

  await app.listen(3000);
}
bootstrap();
