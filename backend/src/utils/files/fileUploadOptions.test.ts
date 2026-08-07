import { fileUploadOptions } from './fileUploadOptions';
import { fileUploadSettings } from './fileUploadSettings';

describe('fileUploadOptions', () => {
  it('bounds multipart request memory and parser work', () => {
    expect(fileUploadOptions.limits).toEqual({
      fieldNameSize: 255,
      fieldSize: 1024 * 1024,
      fileSize: fileUploadSettings.MAX_FILE_SIZE_BYTES,
      files: fileUploadSettings.MAX_FILES_PER_REQUEST,
      fields: fileUploadSettings.MAX_FIELDS_PER_REQUEST,
      parts: fileUploadSettings.MAX_FILES_PER_REQUEST + fileUploadSettings.MAX_FIELDS_PER_REQUEST,
    });
  });
});
