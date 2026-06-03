import { WHITELIST_ASSET_TYPES } from '@/config';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import { ServiceDetails } from '@/interfaces/asset.interface';
import { User } from '@/interfaces/users.interface';
import { enumTitles, getRjsfSchema } from '@/services/jsonschema.service';

export const isAllowedAsset = (asset: Asset): boolean => {
  return !!asset?.type && WHITELIST_ASSET_TYPES.has(asset.type);
};

const HIDDEN_STATUSES: ReadonlySet<Status> = new Set([Status.DRAFT, Status.REPLACED]);

export const isVisibleStatus = (asset: Asset): boolean => {
  return !!asset?.status && !HIDDEN_STATUSES.has(asset.status);
};

const isAddressable = (asset: Asset): boolean => {
  return !!asset?.id;
};

export const toClientAsset = (asset: Asset): Asset => {
  const clientAsset = { ...asset };
  delete clientAsset.partyId;
  delete clientAsset.jsonParameters;
  return clientAsset;
};

export const toVisibleAssets = (assets: Asset[]): Asset[] => {
  return assets.filter(isAllowedAsset).filter(isVisibleStatus).filter(isAddressable);
};

const normalizeArray = (values: unknown): string[] => {
  const rawValues = Array.isArray(values) ? values : typeof values === 'string' ? [values] : [];

  return rawValues
    .map(value => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const entry = value as { value?: unknown; key?: unknown };
        return typeof entry.value === 'string' ? entry.value : typeof entry.key === 'string' ? entry.key : undefined;
      }
      return undefined;
    })
    .filter((value): value is string => Boolean(value));
};

export const toServiceDetails = async (asset: Asset, user: User): Promise<ServiceDetails | undefined> => {
  const param = asset.jsonParameters?.[0];
  if (!param?.value) return undefined;

  let formData: Record<string, unknown> | null;
  try {
    formData = typeof param.value === 'string' ? JSON.parse(param.value) : (param.value as Record<string, unknown>);
  } catch {
    return undefined;
  }
  if (!formData) return undefined;

  const schema = param.schemaId ? await getRjsfSchema(param.schemaId, user) : null;

  return {
    restyp: enumTitles(schema, 'type', normalizeArray(formData.type)),
    transportMode: enumTitles(schema, 'transportMode', normalizeArray(formData.transportMode)),
    aids: enumTitles(schema, 'mobilityAids', normalizeArray(formData.mobilityAids)),
    addon: enumTitles(schema, 'additionalAids', normalizeArray(formData.additionalAids)),
    comment: typeof formData.notes === 'string' ? formData.notes : '',
    isWinterService: formData.isWinterService === 'ja' || formData.isWinterService === true || formData.validityType === 'vinterfardtjanst',
  };
};
