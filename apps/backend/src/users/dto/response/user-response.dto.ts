import { Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  phone!: string;
  role!: string;
  isActive!: boolean;
  avatarUrl!: string | null;

  // BIẾN ĐỔI DỮ LIỆU (TRANSFORMATION)
  @ApiProperty({ example: '2026-05-22T00:00:00.000Z' })
  @Transform(({ value }) => {
    // Kiểm tra xem value có thực sự là một đối tượng Date hợp lệ hay không trước khi gọi hàm .toISOString()
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    if (typeof value === 'string' && value) {
      return new Date(value).toISOString();
    }
    return null;
  }) // Đảm bảo định dạng Date luôn là ISO String
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-22T00:00:00.000Z' })
  @Transform(({ value }) => {
    if (value instanceof Date && !isNaN(value.getTime()))
      return value.toISOString();
    if (typeof value === 'string' && value)
      return new Date(value).toISOString();
    return null;
  })
  lastLoginAt!: Date | null;

  // ẨN DỮ LIỆU NHẠY CẢM
  @Exclude()
  passwordHash!: string;

  // HÀM KHỞI TẠO (CONSTRUCTOR) ĐỂ MAPPING DỮ LIỆU
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
