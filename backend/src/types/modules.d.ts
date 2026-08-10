// Ambient declarations for third-party modules without bundled type definitions
// on the import paths we use. These keep runtime imports unchanged under strict mode.

declare module 'class-transformer/cjs/storage' {
  import { defaultMetadataStorage } from 'class-transformer/types/storage';
  export { defaultMetadataStorage };
}

declare module 'session-file-store' {
  import { Store } from 'express-session';
  import session from 'express-session';

  interface FileStoreOptions {
    [key: string]: unknown;
  }

  type FileStoreConstructor = new (options?: FileStoreOptions) => Store;

  function createFileStore(s: typeof session): FileStoreConstructor;

  export default createFileStore;
}
