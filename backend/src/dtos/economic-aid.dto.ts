import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ANTAL_RUM_VALUES,
  AlternativVistelseadress,
  AntalRum,
  ApplicationKind,
  BOENDEFORM_VALUES,
  BOR_I_HEMMET_VALUES,
  Barn,
  BoendeStep,
  Boendeform,
  BorIHemmet,
  CIVILSTAND_VALUES,
  Civilstand,
  ECONOMIC_AID_SCHEMA_VERSION,
  EconomicAidApplicationV1,
  EconomicAidSchemaVersion,
  HushallStep,
  IdentitetStep,
  InkomsterStep,
  Medsokande,
  SYSSELSATTNING_VALUES,
  SamtyckeStep,
  SituationStep,
  Sysselsattning,
  SysselsattningStep,
  UtbetalningStep,
  UtgifterStep,
  VagvalStep,
} from '@/interfaces/economic-aid.interface';

// Postnummer i form NNN NN (med mellanslag).
const POSTNUMMER_PATTERN = /^\d{3} \d{2}$/;
// Personnummer i form YYYYMMDD-XXXX. Bindestrecket är frivilligt (matchar frontend-fälten och
// backend normaliserar ändå med onlyDigits). Bara mönsterkontroll här — kontrollsiffran (Luhn)
// valideras inte; det görs när uppgiften matchas mot folkbokföringen.
const PERSONNUMMER_PATTERN = /^\d{8}-?\d{4}$/;
// Belopp anges som hela kronor (string av siffror, max 7 siffror).
const AMOUNT_PATTERN = /^\d{1,7}$/;
const FORANDRING_BESKRIVNING_MAX = 500;
const CIVILSTAND_WITH_PARTNER: ReadonlySet<Civilstand> = new Set(['gift', 'sambo']);

export class VagvalStepDto implements VagvalStep {
  @IsIn(['NEW', 'RETURNING'])
  kind!: ApplicationKind;
}

export class AlternativVistelseadressDto implements AlternativVistelseadress {
  @IsString()
  @IsNotEmpty({ message: 'Gatuadress krävs' })
  gatuadress!: string;

  @IsOptional()
  @IsString()
  coAdress!: string;

  @IsString()
  @Matches(POSTNUMMER_PATTERN, { message: 'Postnummer måste anges som NNN NN' })
  postnummer!: string;

  @IsString()
  @IsNotEmpty({ message: 'Postort krävs' })
  postort!: string;
}

export class IdentitetStepDto implements IdentitetStep {
  @IsBoolean({ message: 'Bekräfta om folkbokföringsadressen är din vistelseadress' })
  vistelseadressStammer!: boolean;

  // Alternativ vistelseadress valideras bara när folkbokföringen INTE stämmer.
  @ValidateIf((dto: IdentitetStepDto) => dto.vistelseadressStammer === false)
  @ValidateNested()
  @Type(() => AlternativVistelseadressDto)
  alternativVistelseadress!: AlternativVistelseadressDto;

  @IsEmail({}, { message: 'Ange en giltig e-postadress' })
  epost!: string;

  // Mobiltelefon krävs bara när användaren samtycker till SMS-kontakt.
  // Vi gör inte regex-validering här — formatet kan variera (070-, +46-,
  // mellanslag/bindestreck). Det räcker att fältet finns.
  @ValidateIf((dto: IdentitetStepDto) => dto.kontaktViaSms === true)
  @IsString()
  @IsNotEmpty({ message: 'Mobiltelefon krävs när du valt kontakt via SMS' })
  mobiltelefon!: string;

  @IsBoolean({ message: 'Välj om vi får kontakta dig via SMS' })
  kontaktViaSms!: boolean;

  @IsBoolean({ message: 'Ange om du sökt ekonomiskt bistånd de senaste 3 månaderna' })
  ansoktSenaste3Manader!: boolean;

  @IsBoolean({ message: 'Ange om du behöver tolk' })
  behoverTolk!: boolean;

  @ValidateIf((dto: IdentitetStepDto) => dto.behoverTolk === true)
  @IsString()
  @IsNotEmpty({ message: 'Ange vilket språk du behöver tolk på' })
  tolkSprak!: string;
}

export class MedsokandeDto implements Medsokande {
  @IsString()
  @IsNotEmpty({ message: 'Förnamn på medsökande krävs' })
  fornamn!: string;

  @IsString()
  @IsNotEmpty({ message: 'Efternamn på medsökande krävs' })
  efternamn!: string;

  @IsString()
  @Matches(PERSONNUMMER_PATTERN, {
    message: 'Personnummer på medsökande måste anges som YYYYMMDD-XXXX',
  })
  personnummer!: string;

  // E-post och mobiltelefon är frivilliga uppgifter för medsökande —
  // sökanden anger sina egna kontaktuppgifter i steg 1.
  @ValidateIf((dto: MedsokandeDto) => dto.epost !== undefined && dto.epost !== null && dto.epost !== '')
  @IsEmail({}, { message: 'Ange en giltig e-postadress för medsökande' })
  epost!: string;

  @IsOptional()
  @IsString()
  mobiltelefon!: string;

  @IsBoolean({ message: 'Ange om medsökande behöver tolk' })
  behoverTolk!: boolean;

  @ValidateIf((dto: MedsokandeDto) => dto.behoverTolk === true)
  @IsString()
  @IsNotEmpty({ message: 'Ange vilket språk medsökande behöver tolk på' })
  tolkSprak!: string;
}

export class BarnDto implements Barn {
  @IsString()
  @IsNotEmpty({ message: 'Förnamn på barnet krävs' })
  fornamn!: string;

  @IsString()
  @IsNotEmpty({ message: 'Efternamn på barnet krävs' })
  efternamn!: string;

  @IsString()
  @Matches(PERSONNUMMER_PATTERN, {
    message: 'Personnummer på barnet måste anges som YYYYMMDD-XXXX',
  })
  personnummer!: string;

  @IsIn(BOR_I_HEMMET_VALUES, { message: 'Ange om barnet bor heltid eller deltid' })
  borIHemmet!: BorIHemmet;
}

export class HushallStepDto implements HushallStep {
  @IsIn(CIVILSTAND_VALUES, { message: 'Välj civilstånd' })
  civilstand!: Civilstand;

  @IsBoolean({ message: 'Ange om du har barn under 21 år som bor i hemmet' })
  harBarnUnder21!: boolean;

  // Tomt om harBarnUnder21 = false; minst en rad om true.
  @IsArray()
  @ValidateIf((dto: HushallStepDto) => dto.harBarnUnder21 === true)
  @ArrayMinSize(1, { message: 'Lägg till minst ett barn' })
  @ValidateNested({ each: true })
  @Type(() => BarnDto)
  barn!: BarnDto[];

  // Visas bara vid återansökan + barn — vagval.kind är inte synligt
  // härinifrån, så vi tillåter null här. Frontend ansvarar för att
  // sätta värdet vid återansökan med barn.
  @IsOptional()
  @IsBoolean({ message: 'Ange om barnens situation har förändrats' })
  forandringBarnSedanSenasteAnsokan!: boolean | null;

  @ValidateIf((dto: HushallStepDto) => dto.forandringBarnSedanSenasteAnsokan === true)
  @IsString()
  @IsNotEmpty({ message: 'Beskriv förändringen i barnens situation' })
  @MaxLength(FORANDRING_BESKRIVNING_MAX, {
    message: `Beskrivningen får vara max ${FORANDRING_BESKRIVNING_MAX} tecken`,
  })
  forandringBeskrivning!: string;

  // Medsökande valideras bara när civilstand innebär make/maka/sambo.
  @ValidateIf((dto: HushallStepDto) => CIVILSTAND_WITH_PARTNER.has(dto.civilstand))
  @ValidateNested()
  @Type(() => MedsokandeDto)
  medsokande!: MedsokandeDto;
}

export class BoendeStepDto implements BoendeStep {
  @IsIn(BOENDEFORM_VALUES, { message: 'Välj boendeform' })
  boendeform!: Boendeform;

  @IsString()
  @Matches(AMOUNT_PATTERN, { message: 'Ange månadshyra eller boendekostnad i hela kronor' })
  manadskostnad!: string;

  @IsIn(ANTAL_RUM_VALUES, { message: 'Välj antal rum' })
  antalRum!: AntalRum;

  @IsBoolean({ message: 'Ange om garage eller p-plats ingår i hyran' })
  garagePplatsIngar!: boolean;

  @IsString()
  @Matches(AMOUNT_PATTERN, { message: 'Ange kostnad för hushållsel i hela kronor' })
  hushallsel!: string;

  @IsString()
  @Matches(AMOUNT_PATTERN, { message: 'Ange kostnad för hemförsäkring i hela kronor' })
  hemforsakring!: string;
}

export class SysselsattningStepDto implements SysselsattningStep {
  @IsIn(SYSSELSATTNING_VALUES, { message: 'Välj nuvarande sysselsättning' })
  nuvarandeSysselsattning!: Sysselsattning;

  // AF-frågan är bara aktuell vid arbetssökande.
  @ValidateIf((dto: SysselsattningStepDto) => dto.nuvarandeSysselsattning === 'arbetssokande')
  @IsBoolean({ message: 'Ange om du är registrerad hos Arbetsförmedlingen' })
  registreradHosAf!: boolean | null;

  @IsBoolean({ message: 'Ange om du studerar' })
  studerar!: boolean;

  @ValidateIf((dto: SysselsattningStepDto) => dto.studerar === true)
  @IsString()
  @IsNotEmpty({ message: 'Ange lärosäte eller skolform' })
  larosateSkolform!: string;

  @IsBoolean({ message: 'Ange om du är sjukskriven' })
  sjukskriven!: boolean;
}

export class SamtyckeStepDto implements SamtyckeStep {
  @Equals(true, { message: 'Samtycke till datahämtning krävs' })
  consentDataFetch!: boolean;

  @Equals(true, { message: 'Sanningsförsäkran krävs' })
  truthAffirmation!: boolean;

  @Equals(true, { message: 'Bekräftelse av meddelandeskyldighet krävs' })
  notifyChanges!: boolean;
}

/**
 * Body for POST /economic-aid/eligibility. Only the civilstånd is sent from the
 * client — the applicant's personnummer is taken from the authenticated session
 * server-side, never trusted from the request.
 */
export class EligibilityRequestDto {
  @IsIn(CIVILSTAND_VALUES, { message: 'Välj civilstånd' })
  civilstand!: Civilstand;

  // Medsökandes personnummer (YYYYMMDD-XXXX) — krävs när civilstånd innebär
  // make/maka/sambo, eftersom eligibility då kontrollerar båda parter.
  @ValidateIf((dto: EligibilityRequestDto) => CIVILSTAND_WITH_PARTNER.has(dto.civilstand))
  @IsString()
  @Matches(PERSONNUMMER_PATTERN, {
    message: 'Personnummer på medsökande måste anges som YYYYMMDD-XXXX',
  })
  medsokandePersonnummer!: string;
}

/**
 * Body for POST /economic-aid/applications/:slug. A thin envelope around the typed
 * financial-assistance payload — caremanagement owns the deep validation of `data`
 * (@OneOf enums etc.), so here we only require that `data` is present.
 */
/** One question/answer row in the application sammanställning-PDF. */
export class ApplicationPdfRowDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;

  // The form's help text for this question, when it has one.
  @IsOptional()
  @IsString()
  info?: string;
}

/** A titled group of question/answer rows (a sub-section within a numbered group). */
export class ApplicationPdfSectionDto {
  // Optional sub-heading within a group.
  @IsOptional()
  @IsString()
  heading?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationPdfRowDto)
  rows!: ApplicationPdfRowDto[];

  // The form's help text for this section, when it has one.
  @IsOptional()
  @IsString()
  info?: string;

  // Person sections carry the role so the backend can attach the right person.
  @IsOptional()
  @IsIn(['APPLICANT', 'CO_APPLICANT'])
  role?: 'APPLICANT' | 'CO_APPLICANT';

  // When true, the backend prepends this person's personnummer + folkbokföringsadress (Citizen).
  @IsOptional()
  @IsBoolean()
  identity?: boolean;
}

/** A numbered group, e.g. "1. Personuppgifter". */
export class ApplicationPdfGroupDto {
  @IsString()
  heading!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationPdfSectionDto)
  sections!: ApplicationPdfSectionDto[];
}

/** A signer's BankID signature shown at the bottom of the PDF. Backend-populated; currently mocked. */
export class ApplicationPdfSignatureDto {
  @IsString()
  name!: string;

  @IsString()
  personnummer!: string;

  @IsString()
  checksum!: string;

  @IsString()
  signedAt!: string;
}

/**
 * Human-readable application summary used to render the attached PDF. Built on the frontend (which
 * owns the form labels); the backend only lays it out. Required — the PDF is mandatory on submit.
 */
export class ApplicationPdfSummaryDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationPdfGroupDto)
  groups!: ApplicationPdfGroupDto[];

  // Backend-populated (mocked BankID signatures); not sent by the client.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationPdfSignatureDto)
  signatures?: ApplicationPdfSignatureDto[];
}

export class CreateFinancialAssistanceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsObject({ message: 'data (ansökningspayload) krävs' })
  data!: Record<string, unknown>;

  @ValidateNested()
  @Type(() => ApplicationPdfSummaryDto)
  summary!: ApplicationPdfSummaryDto;

  // Immutable, re-renderable form snapshot built by the client (FormSnapshot envelope). Forwarded
  // as-is to caremanagement's formSnapshot part — the backend does not inspect its inner shape.
  @IsOptional()
  @IsObject()
  formSnapshot?: Record<string, unknown>;
}

export class EconomicAidApplicationDto implements EconomicAidApplicationV1 {
  @Equals(ECONOMIC_AID_SCHEMA_VERSION)
  schemaVersion!: EconomicAidSchemaVersion;

  @ValidateNested()
  @Type(() => VagvalStepDto)
  vagval!: VagvalStepDto;

  @ValidateNested()
  @Type(() => IdentitetStepDto)
  identitet!: IdentitetStepDto;

  @ValidateNested()
  @Type(() => HushallStepDto)
  hushall!: HushallStepDto;

  @ValidateNested()
  @Type(() => BoendeStepDto)
  boende!: BoendeStepDto;

  @ValidateNested()
  @Type(() => SysselsattningStepDto)
  sysselsattning!: SysselsattningStepDto;

  // Remaining steps are passed through opaquely until they are spec'd.
  @IsObject() inkomster!: InkomsterStep;
  @IsObject() utgifter!: UtgifterStep;
  @IsObject() situation!: SituationStep;
  @IsObject() utbetalning!: UtbetalningStep;

  @ValidateNested()
  @Type(() => SamtyckeStepDto)
  samtycke!: SamtyckeStepDto;
}
