import { Asset } from '@data-contracts/partyassets/data-contracts';
import { useFtErrandAssets, useParkingPermits } from '@services/featureflag-service';
import dayjs from 'dayjs';

const PARKING_PERMIT_EXPIRY_WARNING_MONTHS = 3;

export const AssetType = {
  PARKING_PERMIT: 'PERMIT',
  FT_ERRAND: 'FTErrandAssets',
} as const;

export const isParkingPermit = (asset: Asset): boolean => {
  return asset?.type === AssetType.PARKING_PERMIT;
};

/**
 * Strict allowlist of asset types that may be shown, derived from enabled
 * feature flags. Types not present here (e.g. LICENSE) are never listed.
 */
export const getAllowedAssetTypes = (): string[] => {
  const allowed: string[] = [];
  if (useParkingPermits) allowed.push(AssetType.PARKING_PERMIT);
  if (useFtErrandAssets) allowed.push(AssetType.FT_ERRAND);
  return allowed;
};

export const isAllowedAsset = (asset: Asset): boolean => {
  return !!asset?.type && getAllowedAssetTypes().includes(asset.type);
};

export const filterAllowedAssets = (assets: Asset[] | undefined): Asset[] | undefined => {
  if (!assets) return assets;
  return assets.filter(isAllowedAsset);
};

export const soonExpiring = (asset: Asset): boolean => {
  return !!asset?.validTo && dayjs().add(PARKING_PERMIT_EXPIRY_WARNING_MONTHS, 'month').isAfter(dayjs(asset.validTo));
};

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