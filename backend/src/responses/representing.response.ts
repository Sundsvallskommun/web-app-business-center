import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { ContactSettingAddress } from '@/interfaces/contact-settings';
import {
  RepresentingBusinessEntityClient,
  RepresentingEntityClient,
  RepresentingMode,
  RepresentingPrivateEntityClient,
} from '@/interfaces/representing.interface';
import { ApiResponse } from '@/services/api.service';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ClientContactSettingAddress } from './contactsettings.response';

class RepresentingPrivateEntity implements RepresentingPrivateEntityClient {
  @IsString()
  name!: string;
  @IsString()
  @IsOptional()
  personNumber?: string;
  @ValidateNested()
  @Type(() => Information)
  @IsOptional()
  information?: ClientBusinessInformation;
}

class RepresentingBusinessEntity implements RepresentingBusinessEntityClient {
  @IsString()
  organizationName!: string;
  @IsString()
  organizationNumber!: string;
  @IsBoolean()
  @IsOptional()
  isAuthorizedSignatory?: boolean;
  @ValidateNested()
  @Type(() => Information)
  information!: ClientBusinessInformation;
  @IsBoolean()
  @IsOptional()
  whitelisted?: boolean;
}

class Information {
  @ValidateNested()
  @Type(() => ClientContactSettingAddress)
  address!: ContactSettingAddress;
}

class RepresentingEntity implements RepresentingEntityClient {
  @ValidateNested()
  @Type(() => RepresentingBusinessEntity)
  @IsOptional()
  BUSINESS?: RepresentingBusinessEntityClient;
  @ValidateNested()
  @Type(() => RepresentingPrivateEntity)
  @IsOptional()
  PRIVATE?: RepresentingPrivateEntityClient;
  @IsEnum(RepresentingMode)
  mode!: RepresentingMode;
}

export class ClientRepresentingApiResponse implements ApiResponse<RepresentingEntityClient> {
  @ValidateNested()
  @Type(() => RepresentingEntity)
  data!: RepresentingEntityClient;
  @IsString()
  message!: string;
}
