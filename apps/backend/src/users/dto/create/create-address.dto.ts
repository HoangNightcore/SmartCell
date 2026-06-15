import {
  IsString,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
export class CreateAddressDto {
  @IsString()
  label!: string;

  @IsString()
  fullName!: string;

  @IsPhoneNumber('VN')
  phone!: string;

  @IsString()
  addressLine!: string;

  @IsString()
  street!: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsString()
  district!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
