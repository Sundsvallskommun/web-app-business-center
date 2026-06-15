import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  CreateFinancialAssistanceRequest,
  EligibilityRequest,
  EligibilityResponse,
} from '@/data-contracts/caremanagement/data-contracts';
import { CitizenAddress, CitizenExtended, PersonGuidBatch } from '@/data-contracts/citizen/data-contracts';
import {
  CreateFinancialAssistanceDto,
  EconomicAidApplicationDto,
  EligibilityRequestDto,
} from '@/dtos/economic-aid.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  ApplicantAddress,
  ApplicantProfile,
  Civilstand,
  EconomicAidApplicationV1,
  EligibilityResult,
  SubmitApplicationResponse,
} from '@/interfaces/economic-aid.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import CaremanagementApiService from '@/services/caremanagement-api.service';
import { caremanagementUrl } from '@/utils/caremanagement-url';
import { validateRequestBody } from '@/utils/validate';
import authMiddleware from '@middlewares/auth.middleware';
import { logger } from '@utils/logger';
import { Body, Controller, Get, Param, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

// Citizen-API:t taggar folkbokföringsadressen med addressType. Värdet
// kan variera mellan miljöer ("POPULATION_REGISTRATION_ADDRESS",
// "Folkbokföringsadress" m.m.) — vi väljer hellre lite tolerant.
const POPULATION_REGISTRATION_ADDRESS_TYPES = new Set(['POPULATION_REGISTRATION_ADDRESS', 'POPULATION_REGISTRATION', 'FOLKBOKFORINGSADRESS']);

/** Strips everything but digits — personnummer reaches us in varying formats. */
const onlyDigits = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

/** The three financial-assistance typeSlugs the create endpoint accepts (path-constrained). */
const FINANCIAL_ASSISTANCE_SLUGS: ReadonlySet<string> = new Set([
  'financial-assistance-new',
  'financial-assistance-renewal',
  'financial-assistance-supplementary',
]);

/**
 * caremanagement returns 201 Created with an empty body and the new resource in the Location
 * header. We pull the errand id off the last path segment.
 */
const errandIdFromLocation = (location?: string): string | undefined => {
  if (!location) return undefined;
  const segments = location.split('/').filter(Boolean);
  return segments[segments.length - 1] || undefined;
};

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

// Privacy constraint: we never list other people via Citizen in the citizen-
// facing app. Household members are entered manually; the lookup below runs
// server-side only and is exposed exclusively to the caseworker.

const PARTNER_CIVILSTAND: ReadonlySet<Civilstand> = new Set(['gift', 'sambo']);

type HouseholdMemberRef =
  | { kind: 'BARN'; index: number; fornamn: string; efternamn: string; personnummer: string }
  | { kind: 'MEDSOKANDE'; fornamn: string; efternamn: string; personnummer: string };

type HouseholdAddressFlagReason = 'NOT_AT_APPLICANT_ADDRESS' | 'NOT_FOUND' | 'PROTECTED_IDENTITY' | 'LOOKUP_FAILED';

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

const addressKey = (a: ApplicantAddress): string => `${a.gatuadress.toLowerCase().replace(/\s+/g, ' ').trim()}|${a.postnummer.replace(/\D/g, '')}`;

const addressMatches = (a: ApplicantAddress, b: ApplicantAddress): boolean =>
  addressKey(a) === addressKey(b) && a.gatuadress.trim().length > 0 && a.postnummer.replace(/\D/g, '').length > 0;

const isProtectedIdentity = (citizen: CitizenExtended): boolean => {
  const protectedNR = citizen.protectedNR?.trim();
  const classified = citizen.classified?.trim();
  return !!(protectedNR && protectedNR.length > 0) || !!(classified && classified.length > 0 && classified !== '0');
};

@Controller()
export class EconomicAidController {
  private apiService = new ApiService();
  private caremanagementApiService = new CaremanagementApiService();
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
    const citizenRes = await this.apiService.get<CitizenExtended>({ url: citizenUrl }, req.user).catch(err => {
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

    const andraAdresser = addresses.filter(a => a !== populationAddress && a.address).map(toApplicantAddress);

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

  @Post('/economic-aid/eligibility')
  @OpenAPI({
    summary: 'Resolve which financial assistance application(s) to offer for the logged-in applicant',
  })
  @UseBefore(authMiddleware)
  async checkEligibility(@Req() req: RequestWithUser, @Body() body: EligibilityRequestDto): Promise<ApiResponse<EligibilityResult>> {
    // @Body is typed; routing-controllers does not auto-validate, so validate explicitly.
    await validateRequestBody(EligibilityRequestDto, body);

    // The applicant's personnummer ALWAYS comes from the authenticated session — never from
    // the request body — so a citizen cannot probe eligibility for an arbitrary person.
    const applicant = onlyDigits(req.user?.personNumber);
    if (!applicant) {
      throw new HttpException(401, 'Unauthorized');
    }

    // For gift/sambo a co-applicant is involved — the partner's personnummer comes from the
    // request (entered by the citizen) so eligibility is checked for both parties.
    const coApplicant = PARTNER_CIVILSTAND.has(body.civilstand) ? onlyDigits(body.medsokandePersonnummer) : undefined;

    const eligibilityRequest: EligibilityRequest = { applicant, ...(coApplicant ? { coApplicant } : {}) };
    logger.info(`[economic-aid] eligibility check (civilstånd=${body.civilstand}, coApplicant=${coApplicant ? 'yes' : 'no'})`);

    const response = await this.caremanagementApiService.post<EligibilityResponse>({
      url: caremanagementUrl('errands', 'financial-assistance', 'eligibility'),
      data: eligibilityRequest,
    });

    const eligibility = response.data ?? {};
    const result: EligibilityResult = {
      suggestions: (eligibility.suggestions ?? []).map(suggestion => ({
        typeSlug: suggestion.typeSlug ?? '',
        applicationType: suggestion.applicationType ?? null,
        label: suggestion.label ?? '',
        recommended: suggestion.recommended ?? false,
        periodMonth: suggestion.periodMonth ?? null,
        periodYear: suggestion.periodYear ?? null,
      })),
      message: eligibility.message ?? null,
      reasonCode: eligibility.reasonCode ?? null,
    };

    return { data: result, message: 'success' };
  }

  @Post('/economic-aid/applications/:slug')
  @OpenAPI({
    summary: 'Create a financial assistance errand of the given typeSlug (new/renewal/supplementary)',
  })
  @UseBefore(authMiddleware)
  async createApplication(
    @Req() req: RequestWithUser,
    @Param('slug') slug: string,
    @Body() body: CreateFinancialAssistanceDto,
  ): Promise<ApiResponse<SubmitApplicationResponse>> {
    if (!FINANCIAL_ASSISTANCE_SLUGS.has(slug)) {
      throw new HttpException(400, 'Unknown financial assistance typeSlug');
    }
    await validateRequestBody(CreateFinancialAssistanceDto, body);
    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    // The applicant's personnummer is set from the authenticated session, never trusted from
    // the client. Co-applicant pnr stays as entered by the citizen.
    const applicantPersonalNumber = onlyDigits(req.user.personNumber);
    const persons = body.data?.persons as Array<Record<string, unknown>> | undefined;
    if (applicantPersonalNumber && Array.isArray(persons)) {
      const applicant = persons.find(person => person?.role === 'APPLICANT');
      if (applicant) applicant.personalNumber = applicantPersonalNumber;
    }

    // applicationType is derived server-side from the slug by caremanagement — we never send it.
    const request: CreateFinancialAssistanceRequest = {
      title: body.title?.trim() || 'Ansökan om ekonomiskt bistånd',
      description: body.description,
      priority: body.priority,
      reporterUserId: req.user.partyId,
      data: body.data,
    };

    const created = await this.caremanagementApiService.post<unknown>({
      url: caremanagementUrl('errands', slug),
      data: request,
    });

    const errandId = errandIdFromLocation(created.location);
    if (!errandId) {
      logger.error(`[economic-aid] create (${slug}) returned no Location header (partyId=${req.user.partyId})`);
      throw new HttpException(502, 'Errand was created but no id was returned from caremanagement');
    }

    logger.info(`[economic-aid] created ${slug} errand ${errandId} for partyId=${req.user.partyId}`);
    return { data: { errandId }, message: 'success' };
  }

  @Post('/economic-aid/applications')
  @OpenAPI({ summary: 'Submit an economic aid application' })
  @UseBefore(authMiddleware)
  async submit(@Req() req: RequestWithUser, @Body() body: EconomicAidApplicationV1): Promise<ApiResponse<SubmitApplicationResponse>> {
    // routing-controllers does not auto-validate when @Body is typed as an
    // interface, so we run the DTO check here explicitly. Mirrors the pattern
    // used in case.controller.ts (newCaseMessage).
    await validateRequestBody(EconomicAidApplicationDto, body);

    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    // Best-effort: Citizen outage must never block submission.
    const verification = await this.verifyHouseholdAddresses(body, req);

    // NOTE: the submit flow is being rebuilt around caremanagement's typed financial-assistance
    // model. The previous generic-errand + JSON-parameter mapping no longer matches the contract
    // (Errand has no category/type/parameters; the payload is now a typed FinancialAssistanceData).
    // The new flow is:
    //   1. POST /errands/financial-assistance/eligibility  (applicant + ev. co-applicant pnr)
    //      -> EligibilityResponse.suggestions[] (typeSlug, recommended, label)
    //   2. POST /errands/{typeSlug}  with a CreateFinancialAssistanceRequest (FinancialAssistanceData)
    // Until the rebuilt form collects FinancialAssistanceData we log and return a stub id.
    logger.info(
      `[economic-aid] application received for partyId=${req.user.partyId} kind=${body.vagval.kind} ` +
        `householdFlags=${verification.flags.length} — submit not yet wired to the typed endpoint`,
    );

    return {
      data: { errandId: `stub-${Date.now()}` },
      message: 'success',
    };
  }

  private async verifyHouseholdAddresses(data: EconomicAidApplicationV1, req: RequestWithUser): Promise<HouseholdVerification> {
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
      logger.warn(`[economic-aid] household batch guid lookup failed: ${(err as Error)?.message ?? err}`);
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
        const res = await this.apiService.get<CitizenExtended>({ url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/${match.personId}` }, req.user);
        citizen = res?.data ?? null;
      } catch (err) {
        logger.warn(`[economic-aid] household citizen lookup failed for ${member.kind}: ${(err as Error)?.message ?? err}`);
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
      const res = await this.apiService.get<CitizenExtended>({ url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}` }, req.user);
      const populationAddress = (res?.data?.addresses ?? []).find(isPopulationRegistration);
      return populationAddress ? toApplicantAddress(populationAddress) : null;
    } catch (err) {
      logger.warn(`[economic-aid] applicant population-address lookup failed: ${(err as Error)?.message ?? err}`);
      return null;
    }
  }
}
