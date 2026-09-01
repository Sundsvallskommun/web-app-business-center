import { Asset as AssetType, Status } from '@/data-contracts/partyassets/data-contracts';
import { ApiResponse } from '@/interfaces/service';
import { ParkingPermitRenewalPrefill as ParkingPermitRenewalPrefillType } from '@/services/asset.service';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

// DTO mirroring the part of the external partyassets `Asset` contract that the
// frontend actually consumes. Declared here (instead of importing the raw
// generated contract into the frontend) so the type is exposed through this
// backend's OpenAPI and regenerated into the frontend via `generate:contracts`.
// Fields not used by the frontend (jsonParameters, additionalParameters) are
// intentionally omitted to avoid pulling in nested contract types.
class Asset implements AssetType {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  assetId?: string;
  @IsString()
  @IsOptional()
  origin?: string;
  @IsString()
  @IsOptional()
  partyId?: string;
  @IsString()
  @IsOptional()
  type?: string;
  @IsString()
  @IsOptional()
  issued?: string;
  @IsString()
  @IsOptional()
  validTo?: string;
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
  @IsString()
  @IsOptional()
  statusReason?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  replacesId?: string;
}

export class AssetsApiResponse implements ApiResponse<AssetType[]> {
  @ValidateNested({ each: true })
  @Type(() => Asset)
  data!: AssetType[];
  @IsString()
  message!: string;
}

class ParkingPermitRenewalPrefill implements ParkingPermitRenewalPrefillType {
  @IsString()
  @IsOptional()
  caseMeaning?: string;
  @IsString()
  @IsOptional()
  capacity?: string;
  @IsString()
  @IsOptional()
  reason?: string;
  @IsString({ each: true })
  @IsOptional()
  walkingAids?: string[];
  @IsString()
  @IsOptional()
  walkingAbility?: string;
  @IsString()
  @IsOptional()
  walkingDistanceBeforeRest?: string;
  @IsString()
  @IsOptional()
  walkingDistanceMax?: string;
  @IsString()
  @IsOptional()
  duration?: string;
  @IsString()
  @IsOptional()
  canBeAloneWhileParking?: string;
  @IsString()
  @IsOptional()
  canBeAloneWhileParkingNote?: string;
  @IsString()
  @IsOptional()
  consentContactDoctor?: string;
  @IsString()
  @IsOptional()
  consentViewTransportationService?: string;
  @IsString()
  @IsOptional()
  signingAbility?: string;
  @IsString()
  @IsOptional()
  expirationDate?: string;
}

export class ParkingPermitRenewalPrefillApiResponse implements ApiResponse<ParkingPermitRenewalPrefillType> {
  @ValidateNested()
  @Type(() => ParkingPermitRenewalPrefill)
  data!: ParkingPermitRenewalPrefillType;
  @IsString()
  message!: string;
}
