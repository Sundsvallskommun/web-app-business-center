import { SignMandate } from '@/interfaces/mandates.interface';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class SignMandateDetails implements SignMandate {
  @IsString()
  granteeId!: string;
  @IsDateString()
  activeFrom!: string;
  @IsDateString()
  @IsOptional()
  inactiveAfter?: string;
}
export class MandatePaginationDto {
  @IsInt()
  @IsOptional()
  page?: number;
  @IsInt()
  @IsOptional()
  limit?: number;
}

export class CreateMandateDto {
  @IsString()
  transactionId!: string;
}
