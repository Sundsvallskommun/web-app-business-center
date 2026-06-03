import { Asset, type Status } from '@data-contracts/partyassets/data-contracts';
import dayjs from 'dayjs';

const PARKING_PERMIT_EXPIRY_WARNING_MONTHS = 3;

const PARKING_PERMIT_TYPES: readonly string[] = ['PERMIT', 'PARKINGPERMIT'];

// Display props per status. The backend is the single authority for which
// assets/statuses are returned (DRAFT/REPLACED are filtered out server-side),
// so only the statuses that can reach the client are listed here.
const ASSET_STATUS_PROPS: Record<string, { color: string; tKey: string }> = {
  ACTIVE: { color: 'success', tKey: 'decisions:asset.status.active' },
  EXPIRED: { color: 'error', tKey: 'decisions:asset.status.expired' },
  BLOCKED: { color: 'error', tKey: 'decisions:asset.status.blocked' },
  TEMPORARY: { color: 'warning', tKey: 'decisions:asset.status.temporary' },
};

export const getAssetStatusProps = (status: Status | undefined): { color: string; tKey: string } => {
  return (status && ASSET_STATUS_PROPS[status]) || { color: 'neutral', tKey: 'decisions:asset.status.unknown' };
};

export const isParkingPermit = (asset: Asset): boolean => {
  return !!asset?.type && PARKING_PERMIT_TYPES.includes(asset.type);
};

export const soonExpiring = (asset: Asset): boolean => {
  return !!asset?.validTo && dayjs().add(PARKING_PERMIT_EXPIRY_WARNING_MONTHS, 'month').isAfter(dayjs(asset.validTo));
};

export const formatAssetDate = (date?: string): string | undefined => {
  if (!date) return undefined;

  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format('D MMM YYYY') : undefined;
};

export const formatAssetValidity = (
  asset: Pick<Asset, 'issued' | 'validTo'> | undefined,
  t: (key: string, options?: Record<string, string>) => string
): string => {
  const issued = formatAssetDate(asset?.issued);
  const validTo = formatAssetDate(asset?.validTo);

  if (issued && validTo) return `${issued} – ${validTo}`;
  if (validTo) return t('decisions:asset.validity.until', { date: validTo });
  if (issued) return t('decisions:asset.validity.indefiniteFrom', { date: issued });
  return t('decisions:asset.validity.indefinite');
};
