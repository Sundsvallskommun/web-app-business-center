import { Request } from 'express';
import multer from 'multer';
import { dataDir } from '../util';
import { fileUploadSettings } from './fileUploadSettings';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
type FilterFileNameCallback = (error: Error | null, pass: boolean) => void;

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: DestinationCallback) => {
    cb(null, dataDir(fileUploadSettings.UPLOAD_FOLDER));
  },
  filename: (_req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    cb(null, fileUploadSettings.fileNameFormat(file.originalname));
  },
});

const fileFilter = (_request: Request, file: Express.Multer.File, callback: FilterFileNameCallback): void => {
  if (fileUploadSettings.FILE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const uploadOptions = () => ({
  limits: {
    fieldNameSize: 255,
    fileSize: 1024 * 1024 * 2, // 2mb
  },
  storage,
  fileFilter,
});

export const fileUploadOptions = uploadOptions();
