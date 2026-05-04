import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ApplicationKind,
  BoendeStep,
  ECONOMIC_AID_SCHEMA_VERSION,
  EconomicAidApplicationV1,
  EconomicAidSchemaVersion,
  HushallStep,
  IdentitetStep,
  InkomsterStep,
  SamtyckeStep,
  SituationStep,
  SysselsattningStep,
  UtbetalningStep,
  UtgifterStep,
  VagvalStep,
} from '@/interfaces/economic-aid.interface';

export class VagvalStepDto implements VagvalStep {
  @IsIn(['NEW', 'RETURNING'])
  kind!: ApplicationKind;
}

// Personnummer i form YYYYMMDD-XXXX. Vi kontrollerar bara mönstret här —
// kontrollsiffran (Luhn) valideras inte; det görs när uppgiften matchas
// mot folkbokföringen.
const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;
// Postnummer i form NNN NN (med mellanslag).
const POSTNUMMER_PATTERN = /^\d{3} \d{2}$/;

export class IdentitetStepDto implements IdentitetStep {
  @IsString()
  @IsNotEmpty({ message: 'Förnamn krävs' })
  fornamn!: string;

  @IsString()
  @IsNotEmpty({ message: 'Efternamn krävs' })
  efternamn!: string;

  @IsString()
  @Matches(PERSONNUMMER_PATTERN, { message: 'Personnummer måste anges som YYYYMMDD-XXXX' })
  personnummer!: string;

  @IsOptional()
  @IsString()
  coAdress!: string;

  @IsString()
  @IsNotEmpty({ message: 'Gatuadress krävs' })
  gatuadress!: string;

  @IsString()
  @Matches(POSTNUMMER_PATTERN, { message: 'Postnummer måste anges som NNN NN' })
  postnummer!: string;

  @IsString()
  @IsNotEmpty({ message: 'Postort krävs' })
  postort!: string;

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

  // Steps 2–8 are passed through opaquely until they are spec'd.
  @IsObject() hushall!: HushallStep;
  @IsObject() boende!: BoendeStep;
  @IsObject() sysselsattning!: SysselsattningStep;
  @IsObject() inkomster!: InkomsterStep;
  @IsObject() utgifter!: UtgifterStep;
  @IsObject() situation!: SituationStep;
  @IsObject() utbetalning!: UtbetalningStep;

  @ValidateNested()
  @Type(() => SamtyckeStepDto)
  samtycke!: SamtyckeStepDto;
}
