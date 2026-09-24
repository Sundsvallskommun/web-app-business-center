import {
  DecisionAttachment as DecisionAttachmentType,
  DecisionItem as DecisionItemType,
  DocumentDetails as DocumentDetailsType,
  DocumentItem as DocumentItemType,
  DocumentsOverview as DocumentsOverviewType,
  DocumentSource,
  DocumentStatus,
  DOCUMENT_SOURCES,
  DOCUMENT_STATUSES,
  SourceStatus as SourceStatusType,
} from '@/interfaces/document.interface';
import { ApiResponse } from '@/interfaces/service';
import { Asset } from '@/responses/asset.response';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

const SOURCE_STATUSES = ['OK', 'UNAVAILABLE'] as const;

export class DecisionAttachment implements DecisionAttachmentType {
  @IsInt()
  id!: number;
  @IsString()
  name!: string;
  @IsString()
  @IsOptional()
  mimeType?: string;
  @IsString()
  @IsOptional()
  extension?: string;
}

export class DecisionItem implements DecisionItemType {
  @IsString()
  id!: string;
  @IsIn(DOCUMENT_SOURCES)
  source!: DocumentSource;
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  outcome?: string;
  @IsString()
  @IsOptional()
  decidedAt?: string;
  @IsString()
  @IsOptional()
  validFrom?: string;
  @IsString()
  @IsOptional()
  validTo?: string;
  @IsInt()
  @IsOptional()
  errandId?: number;
  @IsString()
  @IsOptional()
  errandNumber?: string;
  @ValidateNested({ each: true })
  @Type(() => DecisionAttachment)
  attachments!: DecisionAttachment[];
}

export class DocumentItem implements DocumentItemType {
  @IsString()
  id!: string;
  @IsIn(DOCUMENT_SOURCES)
  source!: DocumentSource;
  @IsString()
  title!: string;
  @IsIn(DOCUMENT_STATUSES)
  @IsOptional()
  status?: DocumentStatus;
  @IsString()
  @IsOptional()
  issued?: string;
  @IsString()
  @IsOptional()
  validTo?: string;
  @ValidateNested({ each: true })
  @Type(() => DecisionItem)
  decisions!: DecisionItem[];
}

export class SourceStatus implements SourceStatusType {
  @IsString()
  source!: string;
  @IsIn(SOURCE_STATUSES)
  status!: (typeof SOURCE_STATUSES)[number];
}

export class DocumentsOverview implements DocumentsOverviewType {
  @ValidateNested({ each: true })
  @Type(() => DocumentItem)
  documents!: DocumentItem[];
  @ValidateNested({ each: true })
  @Type(() => DecisionItem)
  unlinkedDecisions!: DecisionItem[];
  @ValidateNested({ each: true })
  @Type(() => SourceStatus)
  sources!: SourceStatus[];
}

export class DocumentsOverviewApiResponse implements ApiResponse<DocumentsOverviewType> {
  @ValidateNested()
  @Type(() => DocumentsOverview)
  data!: DocumentsOverview;
  @IsString()
  message!: string;
}

export class DocumentDetails extends DocumentItem implements DocumentDetailsType {
  @ValidateNested()
  @Type(() => Asset)
  @IsOptional()
  asset?: Asset;
}

export class DocumentDetailsApiResponse implements ApiResponse<DocumentDetailsType> {
  @ValidateNested()
  @Type(() => DocumentDetails)
  data!: DocumentDetails;
  @IsString()
  message!: string;
}
