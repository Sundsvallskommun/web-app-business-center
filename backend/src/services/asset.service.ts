import { WHITELIST_ASSET_TYPES } from '@/config';
import { ExtraParameter } from '@/data-contracts/case-data/data-contracts';
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

// Body of POST /assets/parkingpermit/extend (multipart/form-data fields). The
// Mina sidor renewal form stores Draken's value codes verbatim, so values pass
// through unchanged — the one exception is `circumstancesChanged`, kept on the
// legacy TRUE/FALSE wire format and converted to Draken's Y/N here.
export interface ParkingPermitRenewalBody {
  circumstancesChanged?: string; // 'TRUE' | 'FALSE' -> application.renewal.changedCircumstances Y/N
  date?: string; // current permit expiration date
  walkingAids?: string; // JSON string of string[]
  caseMeaning?: string;
  capacity?: string; // 'DRIVER' | 'PASSENGER'
  reason?: string;
  walkingAbility?: string; // 'true' | 'false'
  walkingDistanceBeforeRest?: string;
  walkingDistanceMax?: string;
  duration?: string; // 'P6M' | 'P1Y' | 'P2Y' | 'P3Y' | 'P4Y' | 'P5Y' | 'P0Y'
  canBeAloneWhileParking?: string; // 'true' | 'false'
  canBeAloneWhileParkingNote?: string;
  consentContactDoctor?: string; // 'true' | 'false'
  consentViewTransportationService?: string; // 'true' | 'false'
  signingAbility?: string; // 'true' | 'false'
  medicalConfirmationRequired?: string; // 'yes' | 'no'
}

// Direct body-field -> extraParameter key map. Keys + value encodings mirror
// Draken's ExtraParametersDto (draken .../data-contracts/backend/data-contracts.ts).
const RENEWAL_PARAMETER_KEYS: Record<string, string> = {
  reason: 'application.reason',
  caseMeaning: 'caseMeaning',
  capacity: 'application.applicant.capacity',
  walkingAbility: 'disability.walkingAbility',
  walkingDistanceBeforeRest: 'disability.walkingDistance.beforeRest',
  walkingDistanceMax: 'disability.walkingDistance.max',
  duration: 'disability.duration',
  canBeAloneWhileParking: 'disability.canBeAloneWhileParking',
  canBeAloneWhileParkingNote: 'disability.canBeAloneWhileParking.note',
  consentContactDoctor: 'consent.contact.doctor',
  consentViewTransportationService: 'consent.view.transportationServiceDetails',
  signingAbility: 'application.applicant.signingAbility',
  date: 'application.renewal.expirationDate',
  medicalConfirmationRequired: 'application.renewal.medicalConfirmationRequired',
};

// Maps a Mina sidor parking-permit renewal submission to CaseData extraParameters.
// Empty fields are omitted so hidden/conditional fields simply don't appear.
export const buildRenewalExtraParameters = (body: ParkingPermitRenewalBody): ExtraParameter[] => {
  const extraParameters: ExtraParameter[] = [];

  for (const [field, key] of Object.entries(RENEWAL_PARAMETER_KEYS)) {
    const value = body[field as keyof ParkingPermitRenewalBody];
    if (value) {
      extraParameters.push({ key, values: [value] });
    }
  }

  // Renewal flag: convert the legacy TRUE/FALSE wire value to Draken's Y/N.
  if (body.circumstancesChanged === 'TRUE' || body.circumstancesChanged === 'FALSE') {
    extraParameters.push({
      key: 'application.renewal.changedCircumstances',
      values: [body.circumstancesChanged === 'TRUE' ? 'Y' : 'N'],
    });
  }

  // Walking aids arrive as a JSON-encoded string[]; emit only when non-empty.
  if (body.walkingAids) {
    try {
      const walkingAidsArray: string[] = JSON.parse(body.walkingAids);
      if (Array.isArray(walkingAidsArray) && walkingAidsArray.length > 0) {
        extraParameters.push({ key: 'disability.aid', values: walkingAidsArray });
      }
    } catch {
      // Invalid JSON, skip walkingAids
    }
  }

  return extraParameters;
};
