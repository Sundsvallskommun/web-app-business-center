import { UploadFile } from '@sk-web-gui/react';

// UX mirror of the backend upload policy (backend/src/utils/files/fileUploadSettings.ts).
// The backend is the enforcing authority and rejects requests over the limit with 400.
export const MAX_FILES_PER_UPLOAD = 10;

export const validateFileCount = (files: UploadFile[] | undefined, errorMessage: string) =>
  !files || files.length <= MAX_FILES_PER_UPLOAD || errorMessage;
