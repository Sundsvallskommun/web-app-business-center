/**
 * Domain model for "Ansökan om ekonomiskt bistånd".
 *
 * The application is captured as a single typed, versioned document.
 * `schemaVersion` is locked to the version the applicant submitted under.
 * Old applications are read using the schema for their version — this file
 * never silently changes the shape of v1.
 *
 * The structure follows the 10-step layout in the Confluence spec
 * (Steg 0–9). For iteration 1 only Step 0 (Vägval), Step 1 (Identitet)
 * and Step 9 (Samtycke) are rendered — the remaining step shapes are
 * declared for forward compatibility.
 */

export const ECONOMIC_AID_SCHEMA_VERSION = '1.0' as const;
export type EconomicAidSchemaVersion = typeof ECONOMIC_AID_SCHEMA_VERSION;

export type ApplicationKind = 'NEW' | 'RETURNING';

/** Steg 0 — vägval ny/återansökan. */
export interface VagvalStep {
  kind: ApplicationKind | null;
}

/**
 * Steg 1 — uppgifter om sökande.
 *
 * Frontend lagrar fältvärden som de skrivs in. Tvåfaldig validering:
 * react-hook-form per-fält i UI:t (e-post, personnummer-mönster, krav)
 * och class-validator på backend (samma regler — backend är källan).
 */
export interface IdentitetStep {
  fornamn: string;
  efternamn: string;
  /** Format YYYYMMDD-XXXX. Lagras med bindestreck. */
  personnummer: string;
  /** Frivilligt — c/o-adress. */
  coAdress: string;
  gatuadress: string;
  /** Format NNN NN. Lagras med mellanslag. */
  postnummer: string;
  postort: string;
  epost: string;
  /** Frivilligt — krävs bara om kontaktViaSms = true. */
  mobiltelefon: string;
  /** Tri-state under utfyllnad; måste vara satt vid Nästa. */
  kontaktViaSms: boolean | null;
  /** Senaste 3 mån — styr automatisk koppling till tidigare ärende. */
  ansoktSenaste3Manader: boolean | null;
  behoverTolk: boolean | null;
  /** Krävs när behoverTolk = true. */
  tolkSprak: string;
}

// Steg 2–8 är inte spec'ade än. Typas som tomma "Record<string, never>"
// för att formuläret ska kompilera incrementellt — när ett steg
// implementeras ersätts dess type med en riktig interface.

/** Steg 2 — hushåll. */
export type HushallStep = Record<string, never>;
/** Steg 3 — boende. */
export type BoendeStep = Record<string, never>;
/** Steg 4 — sysselsättning. */
export type SysselsattningStep = Record<string, never>;
/** Steg 5 — inkomster. */
export type InkomsterStep = Record<string, never>;
/** Steg 6 — övriga utgifter. */
export type UtgifterStep = Record<string, never>;
/** Steg 7 — situation och bakgrund. */
export type SituationStep = Record<string, never>;
/** Steg 8 — bankkonto och utbetalning. */
export type UtbetalningStep = Record<string, never>;

/** Steg 9 — samtycke och underskrift. */
export interface SamtyckeStep {
  /** SSBTEK-datahämtning från FK, Skatteverket m.fl. */
  consentDataFetch: boolean;
  /** Sanningsförsäkran (uppgifterna är sanna och fullständiga). */
  truthAffirmation: boolean;
  /** Förbinder sig att meddela förändringar under bidragsperioden. */
  notifyChanges: boolean;
}

export interface EconomicAidApplicationV1 {
  schemaVersion: EconomicAidSchemaVersion;
  vagval: VagvalStep;
  identitet: IdentitetStep;
  hushall: HushallStep;
  boende: BoendeStep;
  sysselsattning: SysselsattningStep;
  inkomster: InkomsterStep;
  utgifter: UtgifterStep;
  situation: SituationStep;
  utbetalning: UtbetalningStep;
  samtycke: SamtyckeStep;
}

export const emptyEconomicAidApplication = (): EconomicAidApplicationV1 => ({
  schemaVersion: ECONOMIC_AID_SCHEMA_VERSION,
  vagval: { kind: null },
  identitet: {
    fornamn: '',
    efternamn: '',
    personnummer: '',
    coAdress: '',
    gatuadress: '',
    postnummer: '',
    postort: '',
    epost: '',
    mobiltelefon: '',
    kontaktViaSms: null,
    ansoktSenaste3Manader: null,
    behoverTolk: null,
    tolkSprak: '',
  },
  hushall: {},
  boende: {},
  sysselsattning: {},
  inkomster: {},
  utgifter: {},
  situation: {},
  utbetalning: {},
  samtycke: {
    consentDataFetch: false,
    truthAffirmation: false,
    notifyChanges: false,
  },
});

export const ECONOMIC_AID_STEPS = [
  { key: 'vagval', label: 'Vägval' },
  { key: 'identitet', label: 'Sökande' },
  { key: 'hushall', label: 'Hushåll' },
  { key: 'boende', label: 'Boende' },
  { key: 'sysselsattning', label: 'Sysselsättning' },
  { key: 'inkomster', label: 'Inkomster' },
  { key: 'utgifter', label: 'Kostnader' },
  { key: 'situation', label: 'Situation' },
  { key: 'utbetalning', label: 'Utbetalning' },
  { key: 'samtycke', label: 'Bekräftelse' },
] as const;

export type EconomicAidStepKey = (typeof ECONOMIC_AID_STEPS)[number]['key'];
