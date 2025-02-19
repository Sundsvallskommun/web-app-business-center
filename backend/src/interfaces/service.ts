import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export interface ApiResponseMeta {
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export class ResponseData<T> implements ApiResponse<T> {
  @ValidateNested({ each: true })
  @Type(() => options => options.newObject.constructor.dataType)
  data: T;

  @IsString()
  message: string;

  constructor(data: T, message = 'success') {
    this.data = data;
    this.message = message;
  }
}
