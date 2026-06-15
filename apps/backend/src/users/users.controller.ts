import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserRole } from '@prisma/client';
import { UpdateProfileDto } from './dto/update/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create/create-address.dto';
import { UpdateAddressDto } from './dto/update/update-address.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ toàn bộ các endpoint bên dưới
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =============================================================
  // ENDPOINTS DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // =============================================================

  // ──────────────── Profile ────────────────────────────────────────
  @Get('me')
  async getMyProfile(@CurrentUser() user: UserResponseDto) {
    // Trả về full profile thay vì UserResponseDto nhẹ từ JWT
    return this.usersService.getFullProfile(user.id);
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
  }

  // ────────────────────── Addresses ─────────────────────────────────
  @Get('me/addresses')
  async getAddresses(@CurrentUser() user: UserResponseDto) {
    return this.usersService.getAddresses(user.id);
  }

  @Get('me/addresses/:id')
  async getAddress(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.getAddressById(user.id, id);
  }

  @Post('me/addresses')
  async createAddress(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Put('me/addresses/:id')
  async updateAddress(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usersService.deleteAddress(user.id, id);
  }

  @Patch('me/addresses/:id/default')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefaultAddress(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usersService.setDefaultAddress(user.id, id);
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
