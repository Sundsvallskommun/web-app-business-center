import { MulterError } from 'multer';
import { fileUploadSettings } from './fileUploadSettings';

const fileUploadErrorCodes = {
  FILE_TOO_LARGE: 'UPLOAD_FILE_TOO_LARGE',
  FIELD_NAME_MISSING: 'UPLOAD_FIELD_NAME_MISSING',
  FIELD_NAME_TOO_LONG: 'UPLOAD_FIELD_NAME_TOO_LONG',
  FIELD_TOO_LARGE: 'UPLOAD_FIELD_TOO_LARGE',
  TOO_MANY_FIELDS: 'UPLOAD_TOO_MANY_FIELDS',
  TOO_MANY_FILES: 'UPLOAD_TOO_MANY_FILES',
  TOO_MANY_PARTS: 'UPLOAD_TOO_MANY_PARTS',
  UNEXPECTED_FILE: 'UPLOAD_UNEXPECTED_FILE',
} as const;

type FileUploadErrorCode = (typeof fileUploadErrorCodes)[keyof typeof fileUploadErrorCodes];

interface FileUploadErrorResponse {
  code: FileUploadErrorCode;
  field?: string;
  message: string;
}

interface FileUploadErrorDetails {
  code: FileUploadErrorCode;
  defaultField?: string;
  message: string;
}

type MulterRuntimeErrorCode = MulterError['code'] | 'MISSING_FIELD_NAME';

const bytesPerMb = 1024 * 1024;
const maxFieldSizeMb = fileUploadSettings.MAX_FIELD_SIZE_BYTES / bytesPerMb;
const maxFileSizeMb = fileUploadSettings.MAX_FILE_SIZE_BYTES / bytesPerMb;
const maxPartsPerRequest = fileUploadSettings.MAX_FILES_PER_REQUEST + fileUploadSettings.MAX_FIELDS_PER_REQUEST;

const fileUploadErrors = {
  LIMIT_FILE_COUNT: {
    code: fileUploadErrorCodes.TOO_MANY_FILES,
    defaultField: 'files',
    message: `Du kan bifoga högst ${fileUploadSettings.MAX_FILES_PER_REQUEST} filer.`,
  },
  LIMIT_FILE_SIZE: {
    code: fileUploadErrorCodes.FILE_TOO_LARGE,
    defaultField: 'files',
    message: `En bifogad fil får vara högst ${maxFileSizeMb} MB.`,
  },
  LIMIT_FIELD_COUNT: {
    code: fileUploadErrorCodes.TOO_MANY_FIELDS,
    message: `Formuläret innehåller fler än ${fileUploadSettings.MAX_FIELDS_PER_REQUEST} textfält.`,
  },
  LIMIT_FIELD_KEY: {
    code: fileUploadErrorCodes.FIELD_NAME_TOO_LONG,
    message: 'Ett formulärfält har ett för långt namn.',
  },
  LIMIT_FIELD_VALUE: {
    code: fileUploadErrorCodes.FIELD_TOO_LARGE,
    message: `Ett textfält får innehålla högst ${maxFieldSizeMb} MB.`,
  },
  LIMIT_PART_COUNT: {
    code: fileUploadErrorCodes.TOO_MANY_PARTS,
    message: `Formuläret får innehålla högst ${maxPartsPerRequest} textfält och filer sammanlagt.`,
  },
  LIMIT_UNEXPECTED_FILE: {
    code: fileUploadErrorCodes.UNEXPECTED_FILE,
    defaultField: 'files',
    message: 'Den valda filen kan inte bifogas i det här fältet.',
  },
  MISSING_FIELD_NAME: {
    code: fileUploadErrorCodes.FIELD_NAME_MISSING,
    message: 'Ett formulärfält saknar namn.',
  },
} satisfies Record<MulterRuntimeErrorCode, FileUploadErrorDetails>;

const unknownUploadError: FileUploadErrorDetails = {
  code: fileUploadErrorCodes.UNEXPECTED_FILE,
  message: 'Uppladdningen kunde inte behandlas.',
};

export const toFileUploadErrorResponse = (error: MulterError): FileUploadErrorResponse => {
  const details: FileUploadErrorDetails = fileUploadErrors[error.code as MulterRuntimeErrorCode] ?? unknownUploadError;
  const { defaultField, ...response } = details;
  const field = error.field ?? defaultField;

  return field ? { ...response, field } : response;
};
