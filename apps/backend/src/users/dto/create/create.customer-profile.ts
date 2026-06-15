import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateCustomerProfile {
  @IsOptional()
  @IsIn(['nam', 'nữ', 'khác'])
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
