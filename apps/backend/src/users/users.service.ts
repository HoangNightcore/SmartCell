import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create/create-user.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { CustomerProfileResponseDto } from './dto/response/customer-profile.response.dto';
import { UpdateProfileDto } from './dto/update/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AddressResponseDto } from './dto/response/address-response.dto';
import { CreateAddressDto } from './dto/create/create-address.dto';
import { UpdateAddressDto } from './dto/update/update-address.dto';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Định nghĩa type dựa trên đúng cấu trúc include của query
type UserWithFullProfile = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        ranks: {
          include: { tier: true };
        };
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  // KHỞI TẠO: Nhận PrismaService để tương tác với PostgreSQL
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // TẠO MỚI USER (ĐĂNG KÝ)
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, phone, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone)
        throw new ConflictException('Phone number already in use');
    }

    // Hash password
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12),
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Dùng transaction: tạo User + CustomerProfile cùng lúc
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash, phone, ...userData },
      });

      // Chỉ tạo CustomerProfile cho CUSTOMER role
      if (newUser.role === UserRole.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return newUser;
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

  // =============================================================
  // PROFILE
  // =============================================================

  // Tạo profile cho customer
  // async createProfileCustomer(
  //   currentUser: UserResponseDto,
  //   createCustomerProfile: CreateCustomerProfile,
  // ): Promise<CustomerProfileResponseDto> {
  //   // Lấy userId từ người dùng đang đăng nhập
  //   const userId = currentUser.id;

  //   // Bóc tách dữ liệu profile gửi lên
  //   const { phone, dateOfBirth, ...userData } = createCustomerProfile;

  //   // Kiểm tra xem user này đã tạo profile chưa
  //   const existingProfile = await this.requireCustomerProfile(userId);
  //   if (existingProfile)
  //     throw new ConflictException('Profile with this user already exists');

  //   // Kiểm tra số điện thoại (nếu có)
  //   if (phone) {
  //     const existingPhone = await this.prisma.customerProfile.findUnique({
  //       where: { phone },
  //     });

  //     if (existingPhone)
  //       throw new ConflictException('Phone number already in use');
  //   }

  //   // Tạo Profile mới
  //   const customerProfile = await this.prisma.customerProfile.create({
  //     data: {
  //       userId,
  //       phone,
  //       ...userData,

  //       dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
  //     },
  //   });

  //   return new CustomerProfileResponseDto({
  //     ...currentUser,
  //     ...customerProfile,
  //     id: currentUser.id,

  //     // Ép kiểu các trường tiền tệ từ Decimal sang String cho phù hợp với response của customerProfile
  //     totalSpent: customerProfile.totalSpent
  //       ? customerProfile.totalSpent.toString()
  //       : null,
  //     averageOrderValue: customerProfile.averageOrderValue
  //       ? customerProfile.averageOrderValue.toString()
  //       : null,
  //   });
  // }

  /**
   * Lấy profile đầy đủ: User + CustomerProfile + Tier hiện tại
   * Khác findById(): nặng hơn nhưng trả về đầy đủ data cho UI
   */

  async getFullProfile(userId: string): Promise<CustomerProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            // Lấy rank mới nhất (sort theo evaluatedAt DESC, lấy 1)
            ranks: {
              where: { status: 'ACTIVE' },
              include: { tier: true },
              orderBy: { evaluatedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.mapToProfileResponse(user);
  }

  /**
   * *Cập nhật profile:
   * - fullName, avatarUrl → bảng User
   * - phone, gender, dateOfBirth → bảng CustomerProfile
   * Dùng transaction để đảm bảo atomicity
   */

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    const { fullName, avatarUrl, phone, gender, dateOfBirth } = dto;

    // Validate phone unique nếu có thay đổi
    if (phone) {
      const profile = await this.prisma.user.findFirst({
        where: { phone, id: { not: userId } },
      });
      if (profile) throw new ConflictException('Phone number already in use');
    }

    // Tách data: field nào thuộc bảng nào
    const uesrFields = { fullName, phone, avatarUrl };
    const profileFields = {
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    };

    // Lọc bỏ undefined để tránh ghi đè null không cần thiết
    const cleanUserFields = Object.fromEntries(
      Object.entries(uesrFields).filter(([, v]) => v !== undefined),
    );
    const cleanProfileFields = Object.fromEntries(
      Object.entries(profileFields).filter(([, v]) => v !== undefined),
    );

    await this.prisma.$transaction(async (tx) => {
      // Update User nếu có field thay đổi
      if (Object.keys(cleanUserFields).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: cleanUserFields,
        });
      }

      // Update CustomerProfile nếu có field thay đổi
      if (Object.keys(cleanProfileFields).length > 0) {
        await tx.customerProfile.update({
          where: { userId },
          data: cleanProfileFields,
        });
      }
    });

    return this.getFullProfile(userId);
  }

  /**
   * *Đổi mật khẩu:
   * 1. Verify currentPassword
   * 2. newPassword === confirmPassword
   * 3. Hash và update
   */

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword)
      throw new BadRequestException(
        'New password and confirm password do not match',
      );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid)
      throw new UnauthorizedException('Current password is incorrect');

    if (currentPassword === newPassword)
      throw new BadRequestException(
        'New password must be different from current password',
      );

    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12),
    );
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  // =========================== Addresses ============================================
  async getAddresses(userId: string): Promise<AddressResponseDto[]> {
    const profile = await this.requireCustomerProfile(userId);

    const addresses = await this.prisma.address.findMany({
      where: { customerId: profile.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((addr) => new AddressResponseDto(addr));
  }

  async getAddressById(
    userId: string,
    addressId: string,
  ): Promise<AddressResponseDto> {
    const profile = await this.requireCustomerProfile(userId);
    const address = await this.verifyAddressOwnership(profile.id, addressId);
    return new AddressResponseDto(address);
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const profile = await this.requireCustomerProfile(userId);

    const address = await this.prisma.$transaction(async (tx) => {
      // Nếu isDefault = true -> unset tất cả các address khác trước
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { customerId: profile.id },
          data: { isDefault: false },
        });
      }

      // Nếu chưa có địa chỉ nào -> tự động set isDefault = true
      const addressCount = await tx.address.count({
        where: { customerId: profile.id },
      });
      const shouldBeDefault = dto.isDefault || addressCount === 0;

      return tx.address.create({
        data: {
          customerId: profile.id,
          label: dto.label,
          fullName: dto.fullName,
          phone: dto.phone,
          addressLine: dto.addressLine,
          street: dto.street,
          ward: dto.ward,
          district: dto.district,
          city: dto.city,
          isDefault: shouldBeDefault,
        },
      });
    });

    return new AddressResponseDto(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const profile = await this.requireCustomerProfile(userId);
    await this.verifyAddressOwnership(profile.id, addressId);

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        // Unset tất cả các address khác
        await tx.address.updateMany({
          where: { customerId: profile.id },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(dto.label && { label: dto.label }),
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.phone && { phone: dto.phone }),
          ...(dto.addressLine && { addressLine: dto.addressLine }),
          ...(dto.street && { street: dto.street }),
          ...(dto.ward !== undefined && { ward: dto.ward }),
          ...(dto.district && { district: dto.district }),
          ...(dto.city && { city: dto.city }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
      });
    });

    return new AddressResponseDto(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const profile = await this.requireCustomerProfile(userId);
    const address = await this.verifyAddressOwnership(userId, addressId);

    // Không cho xóa địa chỉ mặc định nếu chỉ còn 1 địa chỉ
    if (address.isDefault) {
      const count = await this.prisma.address.count({
        where: { customerId: profile.id },
      });
      if (count === 1) {
        throw new BadRequestException('Cannot delete the only default address');
      }
    }

    await this.prisma.address.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const profile = await this.requireCustomerProfile(userId);
    await this.verifyAddressOwnership(profile.id, addressId);

    await this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { customerId: profile.id },
        data: {
          isDefault: false,
        },
      });
      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }

  // =============================================================
  // PRIVATE HELPERS
  // =============================================================

  /**
   * *Lấy CustomerProfile từ userId
   * Throw ForbiddenException nếu user không phải CUSTOMER
   */
  private async requireCustomerProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.CUSTOMER || !user.profile) {
      throw new ForbiddenException('Only customers can access this resource');
    }

    return user.profile;
  }

  /**
   * *Kiểm tra address thuộc về customer
   * Throw NotFoundException nếu không tìm thấy hoặc không thuộc về customer
   */
  private async verifyAddressOwnership(customerId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  /**
   * *Map Prisma raw data → UserProfileResponseDto
   */
  private mapToProfileResponse(
    user: UserWithFullProfile,
  ): CustomerProfileResponseDto {
    const profile = user.profile;
    const activeRank = profile?.ranks?.[0] ?? null;

    return new CustomerProfileResponseDto({
      // User fields
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,

      // CustomerProfile fields (null-safe)
      gender: profile?.gender ?? null,
      dateOfBirth: profile?.dateOfBirth ?? null,
      tierPoint: profile?.tierPoint ?? null,
      totalSpent: profile?.totalSpent?.toString() ?? null,
      totalOrders: profile?.totalOrders ?? null,
      averageOrderValue: profile?.averageOrderValue?.toString() ?? null,
      lastOrderedAt: profile?.lastOrderedAt ?? null,

      // Current tier (null-safe)
      currentTier: activeRank
        ? {
            tierName: activeRank.tier.name,
            tierSlug: activeRank.tier.slug,
            iconUrl: activeRank.tier.iconUrl,
            sortOrder: activeRank.tier.sortOrder,
            status: activeRank.status,
            currentPoint: activeRank.currentPoint,
            totalSpending: activeRank.totalSpending.toString(),
            periodSpending: activeRank.periodSpending.toString(),
            validUntil: activeRank.validUntil,
          }
        : null,
    });
  }
}
