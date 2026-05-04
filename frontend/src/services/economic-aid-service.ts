import {
  ECONOMIC_AID_SCHEMA_VERSION,
  EconomicAidApplicationV1,
  emptyEconomicAidApplication,
} from '@interfaces/economic-aid';

const DRAFT_STORAGE_KEY = 'economic-aid-application-draft-v1';

/**
 * Loads the in-progress draft from sessionStorage. Returns a fresh empty
 * application if no draft exists, the draft fails to parse, or the stored
 * schemaVersion does not match the current version (we never silently
 * migrate — the user is shown a clean form instead).
 */
export const loadEconomicAidDraft = (): EconomicAidApplicationV1 => {
  if (typeof window === 'undefined') {
    return emptyEconomicAidApplication();
  }

  const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return emptyEconomicAidApplication();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<EconomicAidApplicationV1>;
    if (parsed.schemaVersion !== ECONOMIC_AID_SCHEMA_VERSION) {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return emptyEconomicAidApplication();
    }
    // Merge over a fresh empty so missing fields are defaulted instead of undefined.
    return { ...emptyEconomicAidApplication(), ...parsed };
  } catch {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    return emptyEconomicAidApplication();
  }
};

export const saveEconomicAidDraft = (data: EconomicAidApplicationV1): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
};

export const clearEconomicAidDraft = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
};
