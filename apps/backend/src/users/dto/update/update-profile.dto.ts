import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsIn,
  IsDateString,
} from 'class-validator';
export class UpdateProfileDto {
  // --- Từ bảng User ---
  @ApiPropertyOptional({ example: 'Nguyễn Văn A', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // --- Từ bảng CustomerProfile ---
  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({ enum: ['Nam', 'Nữ', 'Khác'] })
  @IsOptional()
  @IsIn(['Nam', 'Nữ', 'Khác'])
  gender?: string;

  @ApiPropertyOptional({
    example: '1995-01-15',
    description: 'ISO 8601 date string',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
