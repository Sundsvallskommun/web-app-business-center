import {
  ContactSetting as IContactSetting,
  ContactChannel as IContactChannel,
  ContactMethod as IContactMethod,
} from '@/data-contracts/contactsettings/data-contracts';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ContactSettingChannel implements IContactChannel {
  @IsString()
  contactMethod!: IContactMethod;
  @IsString()
  destination!: string;
  @IsOptional()
  @IsBoolean()
  disabled!: boolean;
  @IsString()
  alias!: string;
}

export class ContactSetting implements IContactSetting {
  @IsString()
  id!: string;
  @IsString()
  partyId!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSettingChannel)
  contactChannels!: ContactSettingChannel[];
  @IsString()
  created!: string;
  @IsString()
  modified!: string;
  @IsBoolean()
  virtual!: boolean;
  @IsString()
  alias!: string;
  @IsString()
  municipalityId!: string;
}

export interface UpdateContactSettings {
  alias: string;
  virtual?: boolean;
  contactChannels: ContactSettingChannel[];
}

export interface NewContactSettings extends UpdateContactSettings {
  partyId: string;
  createdById: string;
}

export interface ContactSettingAddress {
  street?: string;
  postcode?: string;
  city?: string;
}
