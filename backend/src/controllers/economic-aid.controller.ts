import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Errand, Parameter, Stakeholder } from '@/data-contracts/caremanagement/data-contracts';
import { CitizenAddress, CitizenExtended, PersonGuidBatch } from '@/data-contracts/citizen/data-contracts';
import { EconomicAidApplicationDto } from '@/dtos/economic-aid.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  ApplicantAddress,
  ApplicantProfile,
  Civilstand,
  EconomicAidApplicationV1,
  SubmitApplicationResponse,
} from '@/interfaces/economic-aid.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import { validateRequestBody } from '@/utils/validate';
import authMiddleware from '@middlewares/auth.middleware';
import { logger } from '@utils/logger';
import { Body, Controller, Get, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

const NAMESPACE = 'IFO_EKONOMISKT_BISTAND';

// Citizen-API:t taggar folkbokföringsadressen med addressType. Värdet
// kan variera mellan miljöer ("POPULATION_REGISTRATION_ADDRESS",
// "Folkbokföringsadress" m.m.) — vi väljer hellre lite tolerant.
const POPULATION_REGISTRATION_ADDRESS_TYPES = new Set([
  'POPULATION_REGISTRATION_ADDRESS',
  'POPULATION_REGISTRATION',
  'FOLKBOKFORINGSADRESS',
]);

const formatPostnummer = (raw: string | null | undefined): string => {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length !== 5) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
};

const buildStreetLine = (address: CitizenAddress): string => {
  const street = address.address?.trim() ?? '';
  const number = [address.addressNumber, address.addressLetter].filter(Boolean).join('');
  return [street, number].filter(Boolean).join(' ').trim();
};

const toApplicantAddress = (address: CitizenAddress): ApplicantAddress => ({
  gatuadress: buildStreetLine(address),
  coAdress: address.co?.trim() ?? '',
  postnummer: formatPostnummer(address.postalCode),
  postort: address.city?.trim() ?? '',
  addressType: address.addressType ?? null,
});

const isPopulationRegistration = (address: CitizenAddress): boolean =>
  !!address.addressType && POPULATION_REGISTRATION_ADDRESS_TYPES.has(address.addressType.toUpperCase());

const buildApplicantStakeholder = (req: RequestWithUser): Stakeholder => ({
  role: 'APPLICANT',
  externalId: req.user.partyId,
  externalIdType: 'PRIVATE',
  firstName: req.user.givenName,
  lastName: req.user.surname,
});

// Privacy constraint: we never list other people via Citizen in the citizen-
// facing app. Household members are entered manually; the lookup below runs
// server-side only and is exposed exclusively to the caseworker.

const PARTNER_CIVILSTAND: ReadonlySet<Civilstand> = new Set(['gift', 'sambo']);

type HouseholdMemberRef =
  | { kind: 'BARN'; index: number; fornamn: string; efternamn: string; personnummer: string }
  | { kind: 'MEDSOKANDE'; fornamn: string; efternamn: string; personnummer: string };

type HouseholdAddressFlagReason =
  | 'NOT_AT_APPLICANT_ADDRESS'
  | 'NOT_FOUND'
  | 'PROTECTED_IDENTITY'
  | 'LOOKUP_FAILED';

type HouseholdAddressFlag = {
  kind: HouseholdMemberRef['kind'];
  index?: number;
  fornamn: string;
  efternamn: string;
  personnummer: string;
  reason: HouseholdAddressFlagReason;
};

type HouseholdVerification = {
  checkedAt: string;
  applicantPopulationAddress: ApplicantAddress | null;
  flags: HouseholdAddressFlag[];
};

const collectHouseholdMembers = (data: EconomicAidApplicationV1): HouseholdMemberRef[] => {
  const members: HouseholdMemberRef[] = [];
  const civilstand = data.hushall.civilstand;
  if (civilstand && PARTNER_CIVILSTAND.has(civilstand)) {
    const m = data.hushall.medsokande;
    if (m.personnummer.trim().length > 0) {
      members.push({
        kind: 'MEDSOKANDE',
        fornamn: m.fornamn,
        efternamn: m.efternamn,
        personnummer: m.personnummer,
      });
    }
  }
  data.hushall.barn.forEach((barn, index) => {
    if (barn.personnummer.trim().length > 0) {
      members.push({
        kind: 'BARN',
        index,
        fornamn: barn.fornamn,
        efternamn: barn.efternamn,
        personnummer: barn.personnummer,
      });
    }
  });
  return members;
};

const memberToFlag = (member: HouseholdMemberRef, reason: HouseholdAddressFlagReason): HouseholdAddressFlag =>
  member.kind === 'BARN'
    ? {
        kind: 'BARN',
        index: member.index,
        fornamn: member.fornamn,
        efternamn: member.efternamn,
        personnummer: member.personnummer,
        reason,
      }
    : {
        kind: 'MEDSOKANDE',
        fornamn: member.fornamn,
        efternamn: member.efternamn,
        personnummer: member.personnummer,
        reason,
      };

const addressKey = (a: ApplicantAddress): string =>
  `${a.gatuadress.toLowerCase().replace(/\s+/g, ' ').trim()}|${a.postnummer.replace(/\D/g, '')}`;

const addressMatches = (a: ApplicantAddress, b: ApplicantAddress): boolean =>
  addressKey(a) === addressKey(b) && a.gatuadress.trim().length > 0 && a.postnummer.replace(/\D/g, '').length > 0;

const isProtectedIdentity = (citizen: CitizenExtended): boolean => {
  const protectedNR = citizen.protectedNR?.trim();
  const classified = citizen.classified?.trim();
  return !!(protectedNR && protectedNR.length > 0) || !!(classified && classified.length > 0 && classified !== '0');
};

/**
 * Maps the typed application document to a careManagement Errand.
 *
 * The full application is stored as a single JSON parameter on the
 * errand (`applicationDocument`) together with its `applicationSchemaVersion`.
 * Selected workflow signals are denormalized into separate parameters
 * so handläggar-vyer and BPMN/DMN rules can read them without parsing
 * the document. Add to the denormalized list as the form grows — never
 * read business-critical values from the JSON blob alone.
 */
export const applicationToErrand = (data: EconomicAidApplicationV1, req: RequestWithUser): Errand => ({
  namespace: NAMESPACE,
  title: 'Ansökan om ekonomiskt bistånd',
  category: 'ECONOMIC_AID',
  type: 'APPLICATION',
  status: 'NEW',
  reporterUserId: req.user.partyId,
  stakeholders: [buildApplicantStakeholder(req)],
  externalTags: [{ key: 'submittedFromMyPages', value: 'true' }],
  parameters: [
    {
      key: 'applicationSchemaVersion',
      displayName: 'Schemaversion',
      parameterGroup: 'application',
      values: [data.schemaVersion],
    },
    {
      key: 'applicationKind',
      displayName: 'Ansökningstyp',
      parameterGroup: 'application',
      values: [data.vagval.kind ?? ''],
    },
    {
      key: 'applicationDocument',
      displayName: 'Ansökningsdokument (JSON)',
      parameterGroup: 'application',
      values: [JSON.stringify(data)],
    },
  ],
});

@Controller()
export class EconomicAidController {
  private apiService = new ApiService();
  private citizenApiBase = getApiBase('citizen');

  @Get('/economic-aid/applicant-profile')
  @OpenAPI({ summary: 'Return citizen-derived profile for the logged-in applicant (step 1)' })
  @UseBefore(authMiddleware)
  async getApplicantProfile(@Req() req: RequestWithUser): Promise<ApiResponse<ApplicantProfile>> {
    const { partyId, personNumber } = req.user ?? {};

    if (!partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    const citizenUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}`;
    const citizenRes = await this.apiService
      .get<CitizenExtended>({ url: citizenUrl }, req.user)
      .catch(err => {
        logger.warn(`[economic-aid] failed to fetch citizen for partyId=${partyId}: ${err?.message ?? err}`);
        return null;
      });

    const citizen = citizenRes?.data ?? null;
    const addresses = citizen?.addresses ?? [];

    const populationAddress = addresses.find(isPopulationRegistration);
    // Fallback: om ingen adress är taggad som folkbokföring, ta första
    // som har en gatuadress alls. Bättre att visa något än tomt.
    const folkbokforingsadress = populationAddress
      ? toApplicantAddress(populationAddress)
      : addresses.find(a => a.address)
        ? toApplicantAddress(addresses.find(a => a.address)!)
        : null;

    const andraAdresser = addresses
      .filter(a => a !== populationAddress && a.address)
      .map(toApplicantAddress);

    const profile: ApplicantProfile = {
      fornamn: citizen?.givenname?.trim() || req.user.givenName || '',
      efternamn: citizen?.lastname?.trim() || req.user.surname || '',
      personnummer: personNumber ?? '',
      folkbokforingsadress,
      andraAdresser,
      // Inte tillgängliga i nuvarande Citizen-data-contract — TODO när
      // Migrationsverket-integration finns.
      medborgarskap: null,
      uppehallstillstand: null,
    };

    return { data: profile, message: 'success' };
  }

  @Post('/economic-aid/applications')
  @OpenAPI({ summary: 'Submit an economic aid application' })
  @UseBefore(authMiddleware)
  async submit(
    @Req() req: RequestWithUser,
    @Body() body: EconomicAidApplicationV1,
  ): Promise<ApiResponse<SubmitApplicationResponse>> {
    // routing-controllers does not auto-validate when @Body is typed as an
    // interface, so we run the DTO check here explicitly. Mirrors the pattern
    // used in case.controller.ts (newCaseMessage).
    await validateRequestBody(EconomicAidApplicationDto, body);

    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    const errand = applicationToErrand(body, req);

    // Best-effort: Citizen outage must never block submission.
    const verification = await this.verifyHouseholdAddresses(body, req);
    errand.parameters!.push(...buildVerificationParameters(verification));

    // FIXME: ersätt detta med ett riktigt POST mot caremanagement-/{municipalityId}/{namespace}/errands
    // när IFO-namespacet är registrerat och authn-policyn för Mina sidor → caremanagement är på plats.
    // Tills dess loggar vi payloaden för utveckling/granskning och returnerar en stub-id.
    logger.info(`[economic-aid] would submit errand for partyId=${req.user.partyId} kind=${body.vagval.kind}`);
    logger.debug(`[economic-aid] errand payload: ${JSON.stringify(errand)}`);

    return {
      data: { errandId: `stub-${Date.now()}` },
      message: 'success',
    };
  }

  private async verifyHouseholdAddresses(
    data: EconomicAidApplicationV1,
    req: RequestWithUser,
  ): Promise<HouseholdVerification> {
    const checkedAt = new Date().toISOString();
    const members = collectHouseholdMembers(data);

    const applicantPopulationAddress = await this.fetchApplicantPopulationAddress(req);

    if (members.length === 0) {
      return { checkedAt, applicantPopulationAddress, flags: [] };
    }
    if (!applicantPopulationAddress) {
      return {
        checkedAt,
        applicantPopulationAddress: null,
        flags: members.map(m => memberToFlag(m, 'LOOKUP_FAILED')),
      };
    }

    const cleanPnrs = members.map(m => m.personnummer.replace(/\D/g, ''));
    let batch: PersonGuidBatch[] | null = null;
    try {
      const res = await this.apiService.post<PersonGuidBatch[], string[]>(
        { url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/guid/batch`, data: cleanPnrs },
        req.user,
      );
      batch = Array.isArray(res?.data) ? res.data : null;
    } catch (err) {
      logger.warn(
        `[economic-aid] household batch guid lookup failed: ${(err as Error)?.message ?? err}`,
      );
    }
    if (!batch) {
      return {
        checkedAt,
        applicantPopulationAddress,
        flags: members.map(m => memberToFlag(m, 'LOOKUP_FAILED')),
      };
    }

    const flags: HouseholdAddressFlag[] = [];
    for (const member of members) {
      const cleanPnr = member.personnummer.replace(/\D/g, '');
      const match = batch.find(r => (r.personNumber ?? '').replace(/\D/g, '') === cleanPnr);
      if (!match || !match.success || !match.personId) {
        flags.push(memberToFlag(member, 'NOT_FOUND'));
        continue;
      }
      let citizen: CitizenExtended | null = null;
      try {
        const res = await this.apiService.get<CitizenExtended>(
          { url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/${match.personId}` },
          req.user,
        );
        citizen = res?.data ?? null;
      } catch (err) {
        logger.warn(
          `[economic-aid] household citizen lookup failed for ${member.kind}: ${(err as Error)?.message ?? err}`,
        );
        flags.push(memberToFlag(member, 'LOOKUP_FAILED'));
        continue;
      }
      if (!citizen) {
        flags.push(memberToFlag(member, 'LOOKUP_FAILED'));
        continue;
      }
      if (isProtectedIdentity(citizen)) {
        flags.push(memberToFlag(member, 'PROTECTED_IDENTITY'));
        continue;
      }
      const memberPopulationAddress = (citizen.addresses ?? []).find(isPopulationRegistration);
      if (!memberPopulationAddress) {
        flags.push(memberToFlag(member, 'NOT_AT_APPLICANT_ADDRESS'));
        continue;
      }
      if (!addressMatches(applicantPopulationAddress, toApplicantAddress(memberPopulationAddress))) {
        flags.push(memberToFlag(member, 'NOT_AT_APPLICANT_ADDRESS'));
      }
    }

    return { checkedAt, applicantPopulationAddress, flags };
  }

  private async fetchApplicantPopulationAddress(req: RequestWithUser): Promise<ApplicantAddress | null> {
    const partyId = req.user?.partyId;
    if (!partyId) return null;
    try {
      const res = await this.apiService.get<CitizenExtended>(
        { url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}` },
        req.user,
      );
      const populationAddress = (res?.data?.addresses ?? []).find(isPopulationRegistration);
      return populationAddress ? toApplicantAddress(populationAddress) : null;
    } catch (err) {
      logger.warn(
        `[economic-aid] applicant population-address lookup failed: ${(err as Error)?.message ?? err}`,
      );
      return null;
    }
  }
}

const buildVerificationParameters = (verification: HouseholdVerification): Parameter[] => [
  {
    key: 'householdAddressVerification',
    displayName: 'Hushållskontroll – folkbokföringsadress',
    parameterGroup: 'application',
    values: [JSON.stringify(verification)],
  },
  // Denormalised so caseworker lists and BPMN/DMN rules can filter on
  // "has discrepancy" without parsing the JSON blob.
  {
    key: 'householdAddressFlagsCount',
    displayName: 'Antal avvikelser i hushållets folkbokföring',
    parameterGroup: 'application',
    values: [String(verification.flags.length)],
  },
];
