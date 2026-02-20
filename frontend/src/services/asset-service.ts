import { Asset } from '@data-contracts/partyassets/data-contracts';
import dayjs from 'dayjs';

const PARKING_PERMIT_EXPIRY_WARNING_MONTHS = 3;

export const isParkingPermit = (asset: Asset): boolean => {
  return asset?.type === 'PERMIT';
};

export const soonExpiring = (asset: Asset): boolean => {
  return dayjs().add(PARKING_PERMIT_EXPIRY_WARNING_MONTHS, 'month').isAfter(dayjs(asset.validTo));
};
