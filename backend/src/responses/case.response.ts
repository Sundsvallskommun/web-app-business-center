import { AttachmentResponse as AttachmentResponseType, MessageResponseDirectionEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseStatusResponse as CaseStatusResponseType } from '@/data-contracts/casestatus/data-contracts';
import { FrontendMessageResponse as FrontendMessageResponseType } from '@/interfaces/case.interface';
import { ApiResponse } from '@/interfaces/service';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

// DTOs mirroring the parts of the external case-data / casestatus contracts that
// the frontend actually consumes, exposed through this backend's OpenAPI so they
// are regenerated into the frontend via `generate:contracts`.

export class CaseStatusResponse implements CaseStatusResponseType {
  @IsString()
  @IsOptional()
  caseId?: string;
  @IsString()
  @IsOptional()
  externalCaseId?: string;
  @IsString()
  @IsOptional()
  caseType?: string;
  @IsString()
  @IsOptional()
  status?: string;
  @IsString()
  @IsOptional()
  externalStatus?: string;
  @IsString()
  @IsOptional()
  firstSubmitted?: string;
  @IsString()
  @IsOptional()
  lastStatusChange?: string;
  @IsString()
  @IsOptional()
  system?: string;
  @IsString()
  @IsOptional()
  namespace?: string;
  @IsString()
  @IsOptional()
  errandNumber?: string;
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  propertyDesignations?: string[];
}

export class AttachmentResponse implements AttachmentResponseType {
  @IsString()
  attachmentId: string;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  contentType?: string;
}

export class FrontendMessageResponse implements FrontendMessageResponseType {
  @IsString()
  conversationId: string;
  @IsString()
  messageId: string;
  @IsEnum(MessageResponseDirectionEnum)
  direction: MessageResponseDirectionEnum;
  @IsString()
  message: string;
  @IsString()
  sent: string;
  @IsString()
  sender: string;
  @ValidateNested({ each: true })
  @Type(() => AttachmentResponse)
  attachments: AttachmentResponseType[];
}

export class CasesApiResponse implements ApiResponse<CaseStatusResponseType[]> {
  @ValidateNested({ each: true })
  @Type(() => CaseStatusResponse)
  data: CaseStatusResponseType[];
  @IsString()
  message: string;
}

export class CaseMessagesApiResponse implements ApiResponse<FrontendMessageResponseType[]> {
  @ValidateNested({ each: true })
  @Type(() => FrontendMessageResponse)
  data: FrontendMessageResponseType[];
  @IsString()
  message: string;
}
