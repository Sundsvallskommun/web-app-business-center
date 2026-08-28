import { fileUploadOptions } from './fileUploadOptions';
import { fileUploadSettings } from './fileUploadSettings';

describe('fileUploadOptions', () => {
  it('bounds multipart request memory and parser work', () => {
    expect(fileUploadOptions.limits).toEqual({
      fieldNameSize: fileUploadSettings.MAX_FIELD_NAME_LENGTH,
      fieldSize: fileUploadSettings.MAX_FIELD_SIZE_BYTES,
      fileSize: fileUploadSettings.MAX_FILE_SIZE_BYTES,
      files: fileUploadSettings.MAX_FILES_PER_REQUEST,
      fields: fileUploadSettings.MAX_FIELDS_PER_REQUEST,
      parts: fileUploadSettings.MAX_FILES_PER_REQUEST + fileUploadSettings.MAX_FIELDS_PER_REQUEST,
    });
  });
});
