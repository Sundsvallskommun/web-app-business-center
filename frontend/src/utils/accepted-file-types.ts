/**
 * Application-wide list of file types accepted for upload. Single source of
 * truth for the `accept` attribute on file inputs across the app — import from
 * here instead of redefining the list per feature.
 *
 * Note: this is the client-side hint only. The backend enforces its own list in
 * `fileUploadSettings.FILE_TYPES`; keep the two in rough agreement.
 */
export const documentMimeTypes = [
  'video/quicktime',
  'video/mp4',
  'video/mpeg',
  'video/x-ms-wmv',
  'video/x-msvideo',
  'application/pdf',
  'application/rtf',
  'application/msword',
  'application/x-tika-msoffice',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.ms-outlook',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ACCEPTED_UPLOAD_FILETYPES = [
  'mov',
  'mp4',
  'mpeg',
  'wmv',
  'avi',
  'bmp',
  'gif',
  'tif',
  'tiff',
  'jpeg',
  'jpg',
  'png',
  'htm',
  'html',
  'pdf',
  'rtf',
  'docx',
  'doc',
  'txt',
  'xlsx',
  'xls',
  'pptx',
  'odt',
  'ods',
  'text/html',
  'msg',
  'heic',
  'heif',
  ...documentMimeTypes,
];
