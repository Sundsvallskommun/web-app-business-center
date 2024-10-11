import path from 'path';

export const imageUploadSettings = {
  UPLOAD_FOLDER: 'uploads',
  fileNameFormat: fileName => {
    const fN = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return fN + path.extname(fileName);
  },
  FILE_TYPES: ['image/png', 'image/jpg', 'image/jpeg'],
};
