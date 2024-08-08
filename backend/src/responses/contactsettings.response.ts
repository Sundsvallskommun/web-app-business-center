import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { IsNullable } from '../utils/custom-validation-classes';
import { Address } from '../interfaces/business-engagement';

export class ContactSettingChannel {
  @IsString()
  contactMethod: string;
  @IsString()
  destination: string;
  @IsOptional()
  @IsBoolean()
  disabled: boolean;
  @IsString()
  alias: string;
}

export class Meta {
  @IsNumber()
  page: number;
  @IsNumber()
  limit: number;
  @IsNumber()
  count: number;
  @IsNumber()
  totalRecords: number;
  @IsNumber()
  totalPages: number;
}

export class ContactSetting {
  @IsString()
  id: string;
  @IsString()
  partyId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSettingChannel)
  contactChannels: ContactSettingChannel[];
  @IsString()
  created: string;
  @IsString()
  modified: string;
}

export class UpdateContactSettingsDto {
  @IsString()
  id: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSettingChannel)
  contactChannels: ContactSettingChannel[];
}

export interface UpdateContactSettings {
  alias: string;
  contactChannels: ContactSettingChannel[];
}

export interface NewContactSettings extends UpdateContactSettings {
  partyId: string;
  createdById: string;
}

export class ClientContactSettingNotifications {
  @IsBoolean()
  email_disabled: boolean;
  @IsBoolean()
  phone_disabled: boolean;
}

export class ClientContactSettingDecicionsAndDocuments {
  @IsBoolean()
  digitalInbox: boolean;
  @IsBoolean()
  myPages: boolean;
  @IsBoolean()
  snailmail: boolean;
}

export class ClientContactSettingAddress implements Omit<Address, 'careOf'> {
  @IsString()
  street: string;
  @IsString()
  postcode: string;
  @IsString()
  city: string;
}

export class ClientContactSetting {
  @IsString()
  name: User['name'];
  @IsEmail()
  @IsOptional()
  @IsNullable()
  email: User['email'] | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  phone: string | null;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingAddress)
  @IsOptional()
  @IsNullable()
  address: ClientContactSettingAddress | null;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingNotifications)
  notifications: ClientContactSettingNotifications;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingDecicionsAndDocuments)
  decicionsAndDocuments: ClientContactSettingDecicionsAndDocuments;
}
