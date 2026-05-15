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
 * Faktisk vistelseadress — strukturerad så att handläggaren kan
 * behandla den som en riktig adress (matchning mot register, utskick)
 * istället för fri text.
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
 * de hämtas från Citizen via /economic-aid/applicant-profile och visas
 * skrivskyddat i UI:t. Det enda sökanden bidrar med här är att bekräfta
 * sin vistelseadress.
 *
 * Kontakt-/tolk-/3-månadersfälten ligger temporärt i steg 1 tills de
 * får ett eget kontakt-steg.
 */
export interface IdentitetStep {
  /** Stämmer folkbokföringsadressen med faktisk vistelseadress? */
  vistelseadressStammer: boolean | null;
  /** Ifylls bara när vistelseadressStammer = false. */
  alternativVistelseadress: AlternativVistelseadress;
  epost: string;
  /** Krävs bara om kontaktViaSms = true. */
  mobiltelefon: string;
  kontaktViaSms: boolean | null;
  /** Senaste 3 mån — styr automatisk koppling till tidigare ärende. */
  ansoktSenaste3Manader: boolean | null;
  behoverTolk: boolean | null;
  /** Krävs när behoverTolk = true. */
  tolkSprak: string;
}

/** Profil som hämtas från Citizen och visas skrivskyddat i steg 1. */
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
  /** Saknas i Citizen-contractet idag — visas inte när null. */
  medborgarskap: string | null;
  uppehallstillstand: string | null;
}

// Steg 4–8 (och delar därefter) är inte spec'ade än. Otypade steg
// förblir "Record<string, never>" tills de implementeras.

/**
 * Civilstånd. Vi använder kortformer som värden — texten i UI:t
 * (t.ex. "Gift eller registrerad partner") är bara en etikett.
 */
export const CIVILSTAND_VALUES = ['gift', 'sambo', 'ensamstaende'] as const;
export type Civilstand = (typeof CIVILSTAND_VALUES)[number];

/**
 * Medsökande — make/maka/sambo som ansöker tillsammans med sökanden.
 * Visas bara när civilstand = 'gift' eller 'sambo'. Personnummer
 * anges som YYYYMMDD-XXXX (samma format som sökandens i Citizen).
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
 * Barn under 21 år. Sökanden anger uppgifterna manuellt — vi gör
 * INTE Citizen-uppslagning på andra personnummer än sökandens egna,
 * eftersom det här är en extern medborgar-app.
 */
export interface Barn {
  fornamn: string;
  efternamn: string;
  /** Format YYYYMMDD-XXXX. */
  personnummer: string;
  borIHemmet: BorIHemmet | null;
}

/**
 * Steg 2 — Hushåll.
 *
 * Endast sökandens egna uppgifter får slås upp mot Citizen. Medsökande
 * och barn matas därför in manuellt. V1 frågar civilstånd, om barn
 * finns (+ lista över barnen), ev. förändring sedan senaste ansökan,
 * samt medsökande.
 */
export interface HushallStep {
  civilstand: Civilstand | null;
  /** Barn under 21 år som bor helt eller delvis i hemmet. */
  harBarnUnder21: boolean | null;
  /** Ifylls när harBarnUnder21 = true. */
  barn: Barn[];
  /** Visas bara vid återansökan + harBarnUnder21 = true. */
  forandringBarnSedanSenasteAnsokan: boolean | null;
  /** Krävs när forandringBarnSedanSenasteAnsokan = true. Max 500 tecken. */
  forandringBeskrivning: string;
  /** Ifylls bara när civilstand = 'gift' eller 'sambo'. */
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

/**
 * Steg 3 — Boende. Kostnaderna anges i hela kronor (sträng av siffror)
 * för att matcha övriga fritextinput; tom sträng = ej besvarat.
 * Filuppladdning av hyresavi/fakturor läggs till i kommande iteration.
 */
export interface BoendeStep {
  boendeform: Boendeform | null;
  manadskostnad: string;
  antalRum: AntalRum | null;
  garagePplatsIngar: boolean | null;
  hushallsel: string;
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

/**
 * Steg 4 — Sysselsättning. studerar och sjukskriven är separata Ja/Nej-
 * signaler oavsett huvudsysselsättning, eftersom de styr CSN- respektive
 * FK-kontroller hos handläggare. registreradHosAf är bara aktuell när
 * huvudsysselsättning är arbetssökande. Filuppladdning av AF-intyg och
 * läkarintyg läggs till i kommande iteration.
 */
export interface SysselsattningStep {
  nuvarandeSysselsattning: Sysselsattning | null;
  registreradHosAf: boolean | null;
  studerar: boolean | null;
  larosateSkolform: string;
  sjukskriven: boolean | null;
}
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
    vistelseadressStammer: null,
    alternativVistelseadress: {
      gatuadress: '',
      coAdress: '',
      postnummer: '',
      postort: '',
    },
    epost: '',
    mobiltelefon: '',
    kontaktViaSms: null,
    ansoktSenaste3Manader: null,
    behoverTolk: null,
    tolkSprak: '',
  },
  hushall: {
    civilstand: null,
    harBarnUnder21: null,
    barn: [],
    forandringBarnSedanSenasteAnsokan: null,
    forandringBeskrivning: '',
    medsokande: {
      fornamn: '',
      efternamn: '',
      personnummer: '',
      epost: '',
      mobiltelefon: '',
      behoverTolk: null,
      tolkSprak: '',
    },
  },
  boende: {
    boendeform: null,
    manadskostnad: '',
    antalRum: null,
    garagePplatsIngar: null,
    hushallsel: '',
    hemforsakring: '',
  },
  sysselsattning: {
    nuvarandeSysselsattning: null,
    registreradHosAf: null,
    studerar: null,
    larosateSkolform: '',
    sjukskriven: null,
  },
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
