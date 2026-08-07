import { UploadFile } from '@sk-web-gui/react';

// UX mirror of the backend upload policy (backend/src/utils/files/fileUploadSettings.ts).
// The backend is the enforcing authority and rejects requests over the limit with 400.
const MAX_FILES_PER_UPLOAD = 10;

export const validateFileCount = (files?: UploadFile[]) =>
  !files || files.length <= MAX_FILES_PER_UPLOAD || `Du kan bifoga högst ${MAX_FILES_PER_UPLOAD} filer.`;
