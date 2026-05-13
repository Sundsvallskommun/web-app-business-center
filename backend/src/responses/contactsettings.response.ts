import { Delegate as IDelegate, Filter as IFilter, Rule as IRule, Operator } from '@/data-contracts/contactsettings/data-contracts';
import { ContactSettingAddress } from '@/interfaces/contact-settings';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { IsNullable } from '../utils/custom-validation-classes';

export class ClientContactSettingNotifications {
  @IsBoolean()
  email_enabled: boolean;
  @IsBoolean()
  phone_enabled: boolean;
}

export class ClientContactSettingDecicionsAndDocuments {
  @IsBoolean()
  digitalInbox: boolean;
  @IsBoolean()
  myPages: boolean;
  @IsBoolean()
  snailmail: boolean;
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
  id: string | null;
  @IsString()
  @IsOptional()
  createdById?: string | null;
  @IsString()
  @IsOptional()
  name: User['name'];
  @IsString()
  @IsOptional()
  @IsNullable()
  email: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  phone: string | null;
  @ValidateNested()
  @Type(() => ClientContactSettingAddress)
  @IsOptional()
  @IsNullable()
  address?: ClientContactSettingAddress | null;
  @ValidateNested()
  @Type(() => ClientContactSettingNotifications)
  @IsOptional()
  notifications: ClientContactSettingNotifications;
  @ValidateNested()
  @Type(() => ClientContactSettingDecicionsAndDocuments)
  @IsOptional()
  decicionsAndDocuments: ClientContactSettingDecicionsAndDocuments;
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
  modified: string;
}

export class ClientDelegate implements IDelegate {
  @IsString()
  @IsOptional()
  id?: string | null;
  @IsString()
  @IsOptional()
  principalId?: string;
  @IsString()
  @IsOptional()
  agentId?: string;
  @IsString()
  @IsOptional()
  created?: string;
  @IsString()
  @IsOptional()
  modified?: string;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Filter)
  filters?: Filter[];
}

export class Filter implements IFilter {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  alias?: string;
  @IsString()
  @IsOptional()
  channel?: string;
  @IsString()
  @IsOptional()
  created?: string;
  @IsString()
  @IsOptional()
  modified?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Rule)
  rules: IRule[];
}

class Rule implements IRule {
  @IsString()
  attributeName: string;
  @IsEnum(Operator)
  operator: Operator;
  @IsString()
  attributeValue: string;
}

export class DelegatedContactSetting {
  delegate: ClientDelegate;
  contactSetting: ClientContactSetting;
}
