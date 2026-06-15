// Profile đầy đủ: User + CustomerProfile + Tier
// Auth module KHÔNG dùng class này → safe to change freely
import { Exclude, Transform } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

// Auth module KHÔNG dùng class này → safe to change freelyv
export class CurrentTierDto {
  tierName!: string;
  tierSlug!: string;
  iconUrl!: string | null;
  sortOrder!: number;
  status!: string;
  currentPoint!: number;
  totalSpending!: string;
  periodSpending!: string;
  validUntil!: Date;
}

export class CustomerProfileResponseDto extends UserResponseDto {
  // ── KHÔNG CẦN VIẾT LẠI phần bảng User nữa, vì đã được kế thừa tự động ──

  // ── Từ bảng CustomerProfile (null nếu không phải CUSTOMER) ──
  gender!: string | null;
  dateOfBirth!: Date | null;
  tierPoint!: number | null;
  totalSpent!: string | null; // Decimal → string để tránh mất precision
  totalOrders!: number | null;
  averageOrderValue!: string | null;

  // BIẾN ĐỔI DỮ LIỆU (TRANSFORMATION)
  @ApiProperty({ example: '2026-05-22T00:00:00.000Z' })
  @Transform((value) => {
    // Kiểm tra xem value có thực sự là 1 đối tượng Date hợp lệ hay không
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    if (typeof value === 'string' && value) {
      return new Date(value).toISOString();
    }
  })
  lastOrderedAt!: Date | null;

  // ── Hạng hiện tại ──
  currentTier!: CurrentTierDto | null;

  constructor(partial: Partial<CustomerProfileResponseDto>) {
    super(partial); // Đẩy các dữ liệu của User (email, role...) lên cho class cha xử lý
    Object.assign(this, partial);
  }
}
