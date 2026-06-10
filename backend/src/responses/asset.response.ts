import { Asset as AssetType, Status } from '@/data-contracts/partyassets/data-contracts';
import { ApiResponse } from '@/interfaces/service';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

// DTO mirroring the part of the external partyassets `Asset` contract that the
// frontend actually consumes. Declared here (instead of importing the raw
// generated contract into the frontend) so the type is exposed through this
// backend's OpenAPI and regenerated into the frontend via `generate:contracts`.
// Fields not used by the frontend (jsonParameters, additionalParameters) are
// intentionally omitted to avoid pulling in nested contract types.
export class Asset implements AssetType {
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
  data: AssetType[];
  @IsString()
  message: string;
}
