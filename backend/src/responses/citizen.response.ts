import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { ApiResponse } from '@/interfaces/service';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class Citizen implements Pick<CitizenExtended, 'personId' | 'givenname' | 'lastname'> {
  @IsString()
  personId: string;
  @IsString()
  givenname: string;
  @IsString()
  lastname: string;
}

export class CitizenApiResponse implements ApiResponse<Citizen> {
  @ValidateNested()
  @Type(() => Citizen)
  data: Citizen;
  @IsString()
  message: string;
}
