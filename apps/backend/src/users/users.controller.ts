import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ toàn bộ các endpoint bên dưới
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =============================================================
  // ENDPOINTS DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // =============================================================

  @Get('me')
  async getMyProfile(
    @CurrentUser() user: UserResponseDto,
  ): Promise<UserResponseDto> {
    // user.id được lấy từ JWT Token sau khi qua JwtAuthGuard
    return this.usersService.findById(user.id);
  }

  // =============================================================
  // ENDPOINTS DÀNH CHO ADMIN / STAFF
  // =============================================================

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }
}
