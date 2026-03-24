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
    fileSize: 1024 * 1024 * 50, // 50mb
  },
  storage: multer.memoryStorage(),
  fileFilter,
});

export const fileUploadOptions = uploadOptions();
