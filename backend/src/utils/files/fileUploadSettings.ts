import path from 'path';

export const fileUploadSettings = {
  UPLOAD_FOLDER: 'uploads',
  fileNameFormat: fileName => {
    const fN = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return fN + path.extname(fileName);
  },
  FILE_TYPES: [
    'image/jpeg',
    'image/gif',
    'image/gif',
    'image/png',
    'image/tiff',
    'image/bmp',
    'video/quicktime',
    'video/mp4',
    'video/mpeg',
    'video/x-ms-wmv',
    'video/x-msvideo',
    'application/pdf',
    'application/rtf',
    'application/msword',
    'text/plain',
    'text/html',
    'application/octet-stream',
    'application/vnd.ms-excel',
    'application/vnd.ms-outlook',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};
