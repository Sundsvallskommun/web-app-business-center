import { Request } from 'express';
import multer from 'multer';

/**
 * Tillåtna filtyper för bilagor till ekonomiskt bistånd: PDF, Word (doc/docx), JPG/JPEG och PNG.
 * Egen, snävare lista än den delade fileUploadOptions (som även tillåter video, kalkylark m.m.).
 */
export const ECONOMIC_AID_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

type FilterFileNameCallback = (error: Error | null, pass: boolean) => void;

const fileFilter = (_request: Request, file: Express.Multer.File, callback: FilterFileNameCallback): void => {
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
  callback(null, ECONOMIC_AID_FILE_TYPES.includes(file.mimetype));
};

export const economicAidUploadOptions = {
  limits: {
    fieldNameSize: 255,
    fileSize: 1024 * 1024 * 50, // 50 MB
  },
  storage: multer.memoryStorage(),
  fileFilter,
};
