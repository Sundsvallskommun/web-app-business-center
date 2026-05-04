/**
 * Domain model for "Ansökan om ekonomiskt bistånd".
 *
 * Mirrors the frontend type at frontend/src/interfaces/economic-aid.ts.
 * The intent is to one day promote this to a shared package so that
 * inskick (this app) and handläggning (katla-aid) cannot drift.
 *
 * The application is captured as a versioned typed document rather than
 * a flat key-value list. Old applications are read using the schema for
 * their version — we never silently migrate v1.
 */

export const ECONOMIC_AID_SCHEMA_VERSION = '1.0' as const;
export type EconomicAidSchemaVersion = typeof ECONOMIC_AID_SCHEMA_VERSION;

export type ApplicationKind = 'NEW' | 'RETURNING';

export interface VagvalStep {
  kind: ApplicationKind | null;
}

export interface IdentitetStep {
  fornamn: string;
  efternamn: string;
  personnummer: string;
  coAdress: string;
  gatuadress: string;
  postnummer: string;
  postort: string;
  epost: string;
  mobiltelefon: string;
  kontaktViaSms: boolean | null;
  ansoktSenaste3Manader: boolean | null;
  behoverTolk: boolean | null;
  tolkSprak: string;
}

export interface SamtyckeStep {
  consentDataFetch: boolean;
  truthAffirmation: boolean;
  notifyChanges: boolean;
}

// Steps 2–8 are not yet validated server-side; their shapes live with the
// frontend during iteration 1 and are passed through opaquely as empty
// objects. Replace the type aliases below with real interfaces as each
// step is implemented.
export type HushallStep = Record<string, never>;
export type BoendeStep = Record<string, never>;
export type SysselsattningStep = Record<string, never>;
export type InkomsterStep = Record<string, never>;
export type UtgifterStep = Record<string, never>;
export type SituationStep = Record<string, never>;
export type UtbetalningStep = Record<string, never>;

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

export interface SubmitApplicationResponse {
  errandId: string;
}
