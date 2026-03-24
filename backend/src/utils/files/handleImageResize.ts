import sharp from 'sharp';
import { dataDir } from '../util';
import { imageUploadSettings } from './imageUploadSettings';
import fs from 'fs';

export const handleImageResize = async (fileName: string, size = { width: 64, height: 64 }) => {
  const path = dataDir(imageUploadSettings.UPLOAD_FOLDER + '/' + fileName);
  const image = sharp(path); // path to the stored image
  return image
    .metadata() // get image metadata for size
    .then(function (metadata) {
      if (metadata.width > size.width) {
        image.resize({ width: size.width }).toBuffer(); // resize if too big
        return true;
      } else {
        return false;
      }
    })
    .then(async function (isResized) {
      if (isResized) {
        const newFileName = imageUploadSettings.fileNameFormat(fileName);
        await image.toFile(dataDir(imageUploadSettings.UPLOAD_FOLDER + '/' + newFileName));
        await fs.unlink(path, err => {
          if (err) throw err;
        });
        return newFileName;
      } else {
        return fileName;
      }
    })
    .catch(function (err) {
      return err;
    });
};
