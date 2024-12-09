import { IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsBase64 } from 'class-validator';
import { Type } from 'class-transformer';
import { Classification, Header, MessageAttachment, MessageRequestDirectionEnum } from '@/data-contracts/case-data/data-contracts';

export class MessageAttachmentDTO implements MessageAttachment {
  /**
   * The attachment (file) content as a BASE64-encoded string
   * @example "aGVsbG8gd29ybGQK"
   */
  @IsString()
  @IsBase64()
  content: string;

  /**
   * The attachment filename
   * @example "test.txt"
   */
  @IsString()
  name: string;

  /**
   * The attachment content type
   * @example "text/plain"
   */
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class EmailHeaderDTO {
  /** An email header */
  @IsOptional()
  @IsEnum(Header)
  header?: Header;

  /**
   * The value of the email header
   * @example "[<this-is-a-test@domain.com>]"
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class MessageRequestDTO {
  /**
   * The message ID
   * @example "12"
   */
  @IsOptional()
  @IsString()
  messageID?: string;

  /**
   * The errand number
   * @example "PRH-2022-000001"
   */
  @IsOptional()
  @IsString()
  errandNumber?: string;

  /**
   * If the message is inbound or outbound from the perspective of case-data/e-service.
   * @example "INBOUND"
   */
  @IsOptional()
  @IsEnum(MessageRequestDirectionEnum)
  direction?: MessageRequestDirectionEnum;

  /**
   * The E-service ID that the message was created in
   * @example "12"
   */
  @IsOptional()
  @IsString()
  familyID?: string;

  /**
   * OpenE caseID
   * @example "12"
   */
  @IsOptional()
  @IsString()
  externalCaseID?: string;

  /**
   * The message
   * @example "Hello world"
   */
  @IsOptional()
  @IsString()
  message?: string;

  /**
   * The time the message was sent
   * @example "2020-01-01 12:00:00"
   */
  @IsOptional()
  @IsString()
  sent?: string;

  /**
   * The email-subject of the message
   * @example "Hello world"
   */
  @IsOptional()
  @IsString()
  subject?: string;

  /**
   * The username of the user that sent the message
   * @example "username"
   */
  @IsOptional()
  @IsString()
  username?: string;

  /**
   * The first name of the user that sent the message
   * @example "Kalle"
   */
  @IsOptional()
  @IsString()
  firstName?: string;

  /**
   * The last name of the user that sent the message
   * @example "Anka"
   */
  @IsOptional()
  @IsString()
  lastName?: string;

  /**
   * The message was delivered by
   * @example "EMAIL"
   */
  @IsOptional()
  @IsString()
  messageType?: string;

  /**
   * The mobile number of the recipient
   * @example "+46701234567"
   */
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  /**
   * The email of the user that sent the message
   * @example "kalle.anka@ankeborg.se"
   */
  @IsOptional()
  @IsString()
  email?: string;

  /**
   * The user ID of the user that sent the message
   * @example "12"
   */
  @IsOptional()
  @IsString()
  userID?: string;

  /** Message classification */
  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  /** List of attachmentRequests on the message */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDTO)
  attachmentRequests?: MessageAttachmentDTO[];

  /** List of email headers on the message */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailHeaderDTO)
  emailHeaders?: EmailHeaderDTO[];
}
