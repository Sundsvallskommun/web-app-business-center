import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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
