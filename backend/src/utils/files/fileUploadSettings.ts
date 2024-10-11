import path from 'path';

export const fileUploadSettings = {
  UPLOAD_FOLDER: 'uploads',
  fileNameFormat: fileName => {
    const fN = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return fN + path.extname(fileName);
  },
  FILE_TYPES: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'text/plain',
    '.doc',
    '.docx',
    '.txt',
    '.pdf',
    '.pps',
    '.ppt',
    '.csv',
  ],
};
