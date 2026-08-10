import { ContactSettingAddress } from '@/interfaces/contact-settings';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { IsNullable } from '../utils/custom-validation-classes';

class ClientContactSettingNotifications {
  @IsBoolean()
  email_enabled!: boolean;
  @IsBoolean()
  phone_enabled!: boolean;
}

class ClientContactSettingDecicionsAndDocuments {
  @IsBoolean()
  digitalInbox!: boolean;
  @IsBoolean()
  myPages!: boolean;
  @IsBoolean()
  snailmail!: boolean;
}

export class ClientContactSettingAddress implements ContactSettingAddress {
  @IsString()
  @IsOptional()
  street?: string;
  @IsString()
  @IsOptional()
  postcode?: string;
  @IsString()
  @IsOptional()
  city?: string;
}

export class ClientContactSetting {
  @IsString()
  @IsOptional()
  id!: string | null;
  @IsString()
  @IsOptional()
  createdById?: string | null;
  @IsString()
  @IsOptional()
  name!: User['name'];
  @IsString()
  @IsOptional()
  @IsNullable()
  email!: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  phone!: string | null;
  @ValidateNested()
  @Type(() => ClientContactSettingAddress)
  @IsOptional()
  @IsNullable()
  address?: ClientContactSettingAddress | null;
  @ValidateNested()
  @Type(() => ClientContactSettingNotifications)
  @IsOptional()
  notifications!: ClientContactSettingNotifications;
  @ValidateNested()
  @Type(() => ClientContactSettingDecicionsAndDocuments)
  @IsOptional()
  decicionsAndDocuments!: ClientContactSettingDecicionsAndDocuments;
  @IsBoolean()
  @IsOptional()
  virtual?: boolean;
  @IsString()
  @IsNullable()
  @IsOptional()
  alias?: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  municipalityId?: string | null;
  @IsString()
  @IsOptional()
  modified!: string;
}
