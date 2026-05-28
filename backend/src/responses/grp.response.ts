import {
  GrpCollectResponse,
  GrpInitiateResponse,
  GrpProgressStatus,
  GrpStatus,
  GrpSubjectIdentifier,
  GrpSubjectIdentifierType,
  GrpUserInfo,
  GrpValidationInfo,
  GrpValidationSignatureFormat,
  QrCode,
} from '@/interfaces/grp.interface';
import { ApiResponse } from '@/interfaces/service';
import { IsNullable } from '@/utils/custom-validation-classes';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Sign implements Pick<GrpInitiateResponse, 'transactionId' | 'autoStartToken'>, QrCode {
  @IsString()
  transactionId!: string;
  @IsString()
  autoStartToken!: string;
  @IsString()
  @IsOptional()
  qrCode?: string;
}

class SubjectIdentifier implements GrpSubjectIdentifier {
  @IsString()
  value!: string;
  @IsEnum(GrpSubjectIdentifierType)
  type!: GrpSubjectIdentifierType;
}

class User implements GrpUserInfo {
  @ValidateNested()
  @Type(() => SubjectIdentifier)
  subjectIdentifier!: GrpSubjectIdentifier;
  @IsString()
  @IsOptional()
  displayName?: string;
  @IsString()
  givenName!: string;
  @IsString()
  sn!: string;
  @IsString()
  tin!: string;
  @IsString()
  ipAddress!: string;
}

class Status implements GrpProgressStatus {
  @IsEnum(GrpStatus)
  status!: GrpStatus;
  @IsString()
  @IsNullable()
  substatus!: string | null;
  @IsString()
  message!: string;
}

class ValidationInfo implements GrpValidationInfo {
  @IsString()
  signature!: string;
  @IsEnum(GrpValidationSignatureFormat)
  signatureFormat!: GrpValidationSignatureFormat;
  @IsString()
  @IsOptional()
  ocspResponse?: string;
}

class SignCollect implements GrpCollectResponse, QrCode {
  @ValidateNested()
  @Type(() => Status)
  progressStatus!: GrpProgressStatus;
  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;
  @ValidateNested()
  @Type(() => User)
  @IsOptional()
  userInfo?: GrpUserInfo;
  @ValidateNested()
  @Type(() => ValidationInfo)
  @IsOptional()
  validationInfo?: GrpValidationInfo;
  @IsString()
  transactionId!: string;
  @IsString()
  @IsOptional()
  qrCode?: string;
}

export class SignApiResponse implements ApiResponse<Sign> {
  @ValidateNested()
  @Type(() => Sign)
  data!: Sign;
  @IsString()
  message!: string;
}

export class SignCollectApiResponse implements ApiResponse<SignCollect> {
  @ValidateNested()
  @Type(() => SignCollect)
  data!: SignCollect;
  @IsString()
  message!: string;
}
