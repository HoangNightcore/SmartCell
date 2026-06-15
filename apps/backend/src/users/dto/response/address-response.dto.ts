export class AddressResponseDto {
  id!: string;
  label!: string;
  fullName!: string;
  phone!: string;
  addressLine!: string;
  street!: string;
  ward!: string | null;
  district!: string;
  city!: string;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<AddressResponseDto>) {
    Object.assign(this, partial);
  }
}
