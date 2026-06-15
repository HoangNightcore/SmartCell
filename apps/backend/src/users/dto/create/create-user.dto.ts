import { IsEmail, IsString, MinLength, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsPhoneNumber('VN')
  phone!: string;
}
