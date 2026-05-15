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

/**
 * Profil för sökande, hämtad från Citizen-API:t i steg 1.
 *
 * `medborgarskap` och `uppehallstillstand` saknas i nuvarande Citizen-
 * data-contract — returneras som null tills relevant integration är på
 * plats. Frontend döljer fälten när de är null.
 */
export interface ApplicantAddress {
  gatuadress: string;
  coAdress: string;
  postnummer: string;
  postort: string;
  addressType: string | null;
}

export interface ApplicantProfile {
  fornamn: string;
  efternamn: string;
  personnummer: string;
  folkbokforingsadress: ApplicantAddress | null;
  andraAdresser: ApplicantAddress[];
  medborgarskap: string | null;
  uppehallstillstand: string | null;
}

export interface VagvalStep {
  kind: ApplicationKind | null;
}

/**
 * Faktisk vistelseadress — ifylls när folkbokföringsadressen INTE
 * stämmer med var sökanden faktiskt bor. Strukturerad för att
 * handläggaren ska kunna behandla den som en riktig adress
 * (matchning mot register, utskick m.m.) istället för fri text.
 */
export interface AlternativVistelseadress {
  gatuadress: string;
  coAdress: string;
  /** Format NNN NN. */
  postnummer: string;
  postort: string;
}

/**
 * Steg 1 — Identitet och vistelse.
 *
 * Namn, personnummer och folkbokföringsadress lagras INTE i ansökan —
 * de hämtas från Citizen vid behov via /economic-aid/applicant-profile.
 * Det enda sökanden bidrar med här är bekräftelse av vistelseadress,
 * ev. alternativ vistelseadress, samt uppehållstillstånd-frågan
 * (villkorsstyrd på medborgarskap, ej aktiverad i v1).
 *
 * Kontakt-/tolk-/3-månadersfälten ligger temporärt kvar här tills de
 * får ett eget steg — TODO: flytta till "Kontakt och kommunikation".
 */
export interface IdentitetStep {
  vistelseadressStammer: boolean | null;
  alternativVistelseadress: AlternativVistelseadress;
  // Temporärt placerade — ska flyttas till eget kontakt-steg.
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

/**
 * Civilstånd — kortformer som matchar frontend-konstanten CIVILSTAND_VALUES.
 */
export const CIVILSTAND_VALUES = ['gift', 'sambo', 'ensamstaende'] as const;
export type Civilstand = (typeof CIVILSTAND_VALUES)[number];

/**
 * Medsökande — make/maka/sambo som ansöker tillsammans. Visas i UI:t
 * bara när civilstand = 'gift' eller 'sambo'; valideras serverside
 * via samma villkor.
 */
export interface Medsokande {
  fornamn: string;
  efternamn: string;
  /** Format YYYYMMDD-XXXX. */
  personnummer: string;
  epost: string;
  mobiltelefon: string;
  behoverTolk: boolean | null;
  /** Krävs när behoverTolk = true. */
  tolkSprak: string;
}

export const BOR_I_HEMMET_VALUES = ['heltid', 'deltid'] as const;
export type BorIHemmet = (typeof BOR_I_HEMMET_VALUES)[number];

/**
 * Barn under 21 år i hushållet. Sökanden anger uppgifterna manuellt —
 * vi gör inte Citizen-uppslagning på andra personer än sökanden själv.
 */
export interface Barn {
  fornamn: string;
  efternamn: string;
  /** Format YYYYMMDD-XXXX. */
  personnummer: string;
  borIHemmet: BorIHemmet | null;
}

export interface HushallStep {
  civilstand: Civilstand | null;
  harBarnUnder21: boolean | null;
  /** Ifylls när harBarnUnder21 = true. */
  barn: Barn[];
  forandringBarnSedanSenasteAnsokan: boolean | null;
  forandringBeskrivning: string;
  medsokande: Medsokande;
}

export const BOENDEFORM_VALUES = [
  'hyreslagenhet',
  'bostadsratt',
  'villa',
  'andrahand',
  'inneboende',
  'annat',
] as const;
export type Boendeform = (typeof BOENDEFORM_VALUES)[number];

export const ANTAL_RUM_VALUES = [
  '1_rok',
  '1_rk',
  '2_rk',
  '3_rk',
  '4_rk',
  '5_rk',
  '6plus_rk',
] as const;
export type AntalRum = (typeof ANTAL_RUM_VALUES)[number];

export interface BoendeStep {
  boendeform: Boendeform | null;
  /** kr/månad, sträng av siffror. */
  manadskostnad: string;
  antalRum: AntalRum | null;
  garagePplatsIngar: boolean | null;
  /** kr/månad, sträng av siffror. */
  hushallsel: string;
  /** kr/månad, sträng av siffror. */
  hemforsakring: string;
}

export const SYSSELSATTNING_VALUES = [
  'arbetssokande',
  'anstalld',
  'sjukskriven',
  'foraldraledig',
  'studerar',
  'annat',
] as const;
export type Sysselsattning = (typeof SYSSELSATTNING_VALUES)[number];

export interface SysselsattningStep {
  nuvarandeSysselsattning: Sysselsattning | null;
  /** Krävs när nuvarandeSysselsattning = 'arbetssokande'. */
  registreradHosAf: boolean | null;
  studerar: boolean | null;
  /** Krävs när studerar = true. */
  larosateSkolform: string;
  sjukskriven: boolean | null;
}

// Remaining steps are not yet validated server-side; pass through as empty.
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
