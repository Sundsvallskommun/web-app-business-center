import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { IsNullable } from '../utils/custom-validation-classes';
import { Address } from '../interfaces/business-engagement';

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
  @IsOptional()
  id: string | null;
  @IsString()
  @IsOptional()
  name: User['name'];
  @IsString()
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
  @IsOptional()
  notifications: ClientContactSettingNotifications;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingDecicionsAndDocuments)
  @IsOptional()
  decicionsAndDocuments: ClientContactSettingDecicionsAndDocuments;
}
