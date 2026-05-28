// Ambient declarations for packages that ship without TypeScript types.

declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    version?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    maskPattern?: number;
    toSJISFunc?: (codePoint: string) => number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: { dark?: string; light?: string };
    type?: string;
    rendererOpts?: { quality?: number };
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  export function toDataURL(
    text: string,
    options: QRCodeToDataURLOptions,
    callback: (error: Error | null | undefined, url: string) => void
  ): void;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };
  export default QRCode;
}

declare module 'sanitize-html' {
  interface IOptions {
    allowedTags?: string[] | boolean;
    allowedAttributes?: Record<string, string[]> | boolean;
    selfClosing?: string[];
    allowedSchemes?: string[];
    allowedSchemesByTag?: Record<string, string[]>;
    allowedSchemesAppliedToAttributes?: string[];
    allowProtocolRelative?: boolean;
    enforceHtmlBoundary?: boolean;
    parseStyleAttributes?: boolean;
    transformTags?: Record<
      string,
      | string
      | ((tagName: string, attribs: Record<string, string>) => { tagName: string; attribs: Record<string, string> })
    >;
    exclusiveFilter?: (frame: {
      tag: string;
      attribs: Record<string, string>;
      text: string;
      tagPosition: number;
    }) => boolean;
    nonTextTags?: string[];
    textFilter?: (text: string, tagName: string) => string;
    disallowedTagsMode?: string;
  }

  function sanitizeHtml(dirty: string, options?: IOptions): string;
  namespace sanitizeHtml {
    export type IOptions = IOptions;
  }
  export = sanitizeHtml;
}
