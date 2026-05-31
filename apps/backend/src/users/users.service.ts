import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  // KHỞI TẠO: Nhận PrismaService để tương tác với PostgreSQL
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // TẠO MỚI USER (ĐĂNG KÝ)
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12),
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        ...userData,
      },
    });
    return new UserResponseDto(user);
  }

  // TÌM USER BẰNG EMAIL
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // TÌM USER BẰNG ID
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }

  // KIỂM TRA MẬT KHẨU HỢP LỆ
  async validatePassword(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return new UserResponseDto(user);
  }

  // UPDATE LOGIN CUỐI
  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
