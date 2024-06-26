import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RepresentingMode } from '../interfaces/representing.interface';

export class RepresentsDto {
  @IsString()
  @IsOptional()
  public organizationNumber?: string;
  @IsString()
  @IsOptional()
  public personNumber?: string;
  @IsEnum(RepresentingMode)
  @IsOptional()
  public mode?: RepresentingMode;
}
