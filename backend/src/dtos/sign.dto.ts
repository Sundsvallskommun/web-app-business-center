import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SignMandateDetails } from './mandate.dto';
import { GrpUserMessage, GrpUserMessageFormat } from '@/interfaces/grp.interface';

export class SignDto implements Omit<GrpUserMessage, 'nonVisible'> {
  @IsString()
  visible!: string;
  @IsEnum(GrpUserMessageFormat)
  format!: GrpUserMessageFormat;
  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}
export class SignMandateDto implements Omit<GrpUserMessage, 'nonVisible'> {
  @IsString()
  visible!: string;
  @IsEnum(GrpUserMessageFormat)
  format!: GrpUserMessageFormat;
  @ValidateNested()
  @Type(() => SignMandateDetails)
  mandate?: SignMandateDetails;
}
