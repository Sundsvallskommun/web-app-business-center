import { CaseMessage } from '@/interfaces/case.interface';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CaseMessageDto implements CaseMessage {
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => File)
  files?: File[];
}
