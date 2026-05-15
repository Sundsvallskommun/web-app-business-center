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
// Personnummer i form YYYYMMDD-XXXX. Bara mönsterkontroll här —
// kontrollsiffran (Luhn) valideras inte; det görs när uppgiften
// matchas mot folkbokföringen.
const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;
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
