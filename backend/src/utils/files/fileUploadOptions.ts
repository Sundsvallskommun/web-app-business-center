import { Request } from 'express';
import multer from 'multer';
import { fileUploadSettings } from './fileUploadSettings';

type FilterFileNameCallback = (error: Error | null, pass: boolean) => void;

const fileFilter = (_request: Request, file: Express.Multer.File, callback: FilterFileNameCallback): void => {
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
  if (fileUploadSettings.FILE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const uploadOptions = () => ({
  limits: {
    fieldNameSize: 255,
    fieldSize: 1024 * 1024,
    fileSize: fileUploadSettings.MAX_FILE_SIZE_BYTES,
    files: fileUploadSettings.MAX_FILES_PER_REQUEST,
    fields: fileUploadSettings.MAX_FIELDS_PER_REQUEST,
    parts: fileUploadSettings.MAX_FILES_PER_REQUEST + fileUploadSettings.MAX_FIELDS_PER_REQUEST,
  },
  storage: multer.memoryStorage(),
  fileFilter,
});

export const fileUploadOptions = uploadOptions();
