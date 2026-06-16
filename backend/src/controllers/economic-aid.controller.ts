import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  CreateFinancialAssistanceRequest,
  EligibilityRequest,
  EligibilityResponse,
  RenewalPrefill,
} from '@/data-contracts/caremanagement/data-contracts';
import { CitizenAddress, CitizenExtended, PersonGuidBatch } from '@/data-contracts/citizen/data-contracts';
import { CreateFinancialAssistanceDto, EconomicAidApplicationDto, EligibilityRequestDto } from '@/dtos/economic-aid.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  ApplicantAddress,
  ApplicantProfile,
  Civilstand,
  EconomicAidApplicationV1,
  EligibilityResult,
  PrefillResult,
  SubmitApplicationResponse,
} from '@/interfaces/economic-aid.interface';
import { ApiResponse } from '@/interfaces/service';
import { ContactSetting, ContactSettingChannel, NewContactSettings, UpdateContactSettings } from '@/interfaces/contact-settings';
import { ContactMethod } from '@/data-contracts/contactsettings/data-contracts';
import ApiService from '@/services/api.service';
import CaremanagementApiService from '@/services/caremanagement-api.service';
import { makeClientContactSetting } from '@/services/contact-setting.service';
import { caremanagementUrl } from '@/utils/caremanagement-url';
import { economicAidUploadOptions } from '@/utils/files/economicAidUploadOptions';
import { validateRequestBody } from '@/utils/validate';
import authMiddleware from '@middlewares/auth.middleware';
import { logger } from '@utils/logger';
import { Body, Controller, Get, Param, Post, QueryParam, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

// Citizen-API:t taggar folkbokföringsadressen med addressType. Värdet
// kan variera mellan miljöer ("POPULATION_REGISTRATION_ADDRESS",
// "Folkbokföringsadress" m.m.) — vi väljer hellre lite tolerant.
const POPULATION_REGISTRATION_ADDRESS_TYPES = new Set(['POPULATION_REGISTRATION_ADDRESS', 'POPULATION_REGISTRATION', 'FOLKBOKFORINGSADRESS']);

/** Strips everything but digits — personnummer reaches us in varying formats. */
const onlyDigits = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

/**
 * Builds the EMAIL/SMS contact channels we manage for a person from the contact fields
 * carried on the FA payload. A channel is only emitted when its destination is filled in;
 * the notify-flags decide whether the channel is disabled (no notifications) or active.
 */
const buildManagedChannels = (person: Record<string, unknown>): ContactSettingChannel[] => {
  const email = typeof person.email === 'string' ? person.email.trim() : '';
  const phone = typeof person.phone === 'string' ? person.phone.trim() : '';
  const channels: ContactSettingChannel[] = [];
  if (email) {
    channels.push({ contactMethod: ContactMethod.EMAIL, destination: email, disabled: person.notifyByEmail === false, alias: 'default' });
  }
  if (phone) {
    channels.push({ contactMethod: ContactMethod.SMS, destination: phone, disabled: person.notifyBySms === false, alias: 'default' });
  }
  return channels;
};

const channelKey = (channel: ContactSettingChannel): string =>
  `${channel.contactMethod}|${(channel.destination ?? '').trim()}|${channel.disabled ? 1 : 0}`;

/** True when the managed (EMAIL/SMS) channels already match the form — nothing to write back. */
const managedChannelsUnchanged = (existing: ContactSettingChannel[] | undefined, desired: ContactSettingChannel[]): boolean => {
  const managed = (existing ?? []).filter(channel => channel.contactMethod === ContactMethod.EMAIL || channel.contactMethod === ContactMethod.SMS);
  const existingKeys = managed.map(channelKey).sort();
  const desiredKeys = desired.map(channelKey).sort();
  return existingKeys.length === desiredKeys.length && existingKeys.every((value, index) => value === desiredKeys[index]);
};

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

// Citizen/folkbokföring lägger oftast gatunamnet i `addressArea`; `address` är ibland tomt.
const hasStreet = (address: CitizenAddress): boolean => !!(address.addressArea || address.address);

const buildStreetLine = (address: CitizenAddress): string => {
  const street = (address.addressArea || address.address || '').trim();
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
  private contactSettingsApiBase = getApiBase('contactsettings');

  @Get('/economic-aid/applicant-profile')
  @OpenAPI({ summary: 'Return citizen-derived profile for the logged-in applicant (step 1)' })
  @UseBefore(authMiddleware)
  async getApplicantProfile(@Req() req: RequestWithUser): Promise<ApiResponse<ApplicantProfile>> {
    const { partyId, personNumber } = req.user ?? {};
    if (!partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    const profile = await this.buildProfile(partyId, personNumber ?? '', { fornamn: req.user.givenName, efternamn: req.user.surname }, req);
    return { data: profile, message: 'success' };
  }

  @Get('/economic-aid/co-applicant-profile')
  @OpenAPI({ summary: 'Return citizen-derived profile (name, address, contact) for a co-applicant by personnummer' })
  @UseBefore(authMiddleware)
  async getCoApplicantProfile(
    @Req() req: RequestWithUser,
    @QueryParam('personnummer') personnummer?: string,
  ): Promise<ApiResponse<ApplicantProfile>> {
    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }
    const clean = onlyDigits(personnummer);
    const emptyProfile: ApplicantProfile = {
      fornamn: '',
      efternamn: '',
      personnummer: clean,
      folkbokforingsadress: null,
      andraAdresser: [],
      epost: null,
      telefon: null,
      medborgarskap: null,
      uppehallstillstand: null,
    };

    const partyId = clean ? await this.resolvePartyId(clean, req) : null;
    if (!partyId) {
      return { data: emptyProfile, message: 'success' };
    }

    const profile = await this.buildProfile(partyId, clean, {}, req);
    return { data: profile, message: 'success' };
  }

  /** Builds a citizen-derived profile (name, folkbokföringsadress, e-post, telefon) for a partyId. */
  private async buildProfile(
    partyId: string,
    personnummer: string,
    fallback: { fornamn?: string; efternamn?: string },
    req: RequestWithUser,
  ): Promise<ApplicantProfile> {
    const citizenRes = await this.apiService
      .get<CitizenExtended>({ url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}` }, req.user)
      .catch(err => {
        logger.warn(`[economic-aid] failed to fetch citizen for partyId=${partyId}: ${err?.message ?? err}`);
        return null;
      });

    const citizen = citizenRes?.data ?? null;
    const addresses = citizen?.addresses ?? [];

    const populationAddress = addresses.find(isPopulationRegistration);
    const firstStreetAddress = addresses.find(hasStreet);
    const folkbokforingsadress = populationAddress
      ? toApplicantAddress(populationAddress)
      : firstStreetAddress
      ? toApplicantAddress(firstStreetAddress)
      : null;
    const andraAdresser = addresses.filter(a => a !== populationAddress && hasStreet(a)).map(toApplicantAddress);

    const { epost, telefon } = await this.fetchContactDetails(partyId, req);

    return {
      fornamn: citizen?.givenname?.trim() || fallback.fornamn || '',
      efternamn: citizen?.lastname?.trim() || fallback.efternamn || '',
      personnummer,
      folkbokforingsadress,
      andraAdresser,
      epost,
      telefon,
      medborgarskap: null,
      uppehallstillstand: null,
    };
  }

  @Post('/economic-aid/eligibility')
  @OpenAPI({
    summary: 'Resolve which financial assistance application(s) to offer for the logged-in applicant',
  })
  @UseBefore(authMiddleware)
  async checkEligibility(@Req() req: RequestWithUser, @Body() body: EligibilityRequestDto): Promise<ApiResponse<EligibilityResult>> {
    // @Body is typed; routing-controllers does not auto-validate, so validate explicitly.
    await validateRequestBody(EligibilityRequestDto, body);

    // eligibility keys on partyId (UUID), not personnummer. The applicant's partyId ALWAYS
    // comes from the authenticated session so a citizen cannot probe eligibility for someone else.
    const applicant = req.user?.partyId;
    if (!applicant) {
      throw new HttpException(401, 'Unauthorized');
    }

    // For gift/sambo a co-applicant is involved — resolve the partner's personnummer (entered by
    // the citizen) to a partyId via Citizen so eligibility can be checked for both parties.
    let coApplicant: string | undefined;
    if (PARTNER_CIVILSTAND.has(body.civilstand) && body.medsokandePersonnummer) {
      coApplicant = (await this.resolvePartyId(onlyDigits(body.medsokandePersonnummer), req)) ?? undefined;
    }

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

  @Get('/economic-aid/prefill')
  @OpenAPI({
    summary: "Prefill household children from the applicant's most recent Lifecare normberäkning (återansökan)",
  })
  @UseBefore(authMiddleware)
  async getPrefill(@Req() req: RequestWithUser): Promise<ApiResponse<PrefillResult>> {
    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    const response = await this.caremanagementApiService.get<RenewalPrefill>({
      url: caremanagementUrl('errands', 'financial-assistance', 'prefill'),
      params: { partyId: req.user.partyId },
    });

    const prefill = response.data ?? {};
    const result: PrefillResult = {
      children: (prefill.children ?? []).map(child => ({
        partyId: child.partyId ?? null,
        name: child.name ?? null,
      })),
      lifecareChecked: prefill.lifecareChecked ?? false,
    };

    return { data: result, message: 'success' };
  }

  @Post('/economic-aid/applications/:slug')
  @OpenAPI({
    summary: 'Create a financial assistance errand (multipart: a JSON "payload" field + optional "files")',
  })
  @UseBefore(authMiddleware)
  async createApplication(
    @Req() req: RequestWithUser,
    @Param('slug') slug: string,
    @UploadedFiles('files', { options: economicAidUploadOptions, required: false }) files?: Express.Multer.File[],
  ): Promise<ApiResponse<SubmitApplicationResponse>> {
    if (!FINANCIAL_ASSISTANCE_SLUGS.has(slug)) {
      throw new HttpException(400, 'Unknown financial assistance typeSlug');
    }
    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    // The request is sent as multipart: the application is a JSON string in the "payload" field
    // (alongside the binary "files"). Parse + validate it as the create DTO.
    const rawPayload = (req.body as Record<string, unknown> | undefined)?.payload;
    if (typeof rawPayload !== 'string') {
      throw new HttpException(400, 'Missing application payload');
    }
    let body: CreateFinancialAssistanceDto;
    try {
      body = JSON.parse(rawPayload) as CreateFinancialAssistanceDto;
    } catch {
      throw new HttpException(400, 'Invalid application payload (not valid JSON)');
    }
    await validateRequestBody(CreateFinancialAssistanceDto, body);

    // The EB API identifies persons/children by partyId. The frontend collects personnummer,
    // so resolve those to partyId here (applicant comes straight from the session) and drop the
    // raw personnummer before forwarding.
    await this.resolvePartyIdsOnPayload(body.data, req);

    // applicationType is derived server-side from the slug by caremanagement — we never send it.
    const request: CreateFinancialAssistanceRequest = {
      title: body.title?.trim() || 'Ansökan om ekonomiskt bistånd',
      description: body.description,
      priority: body.priority,
      reporterUserId: req.user.partyId,
      data: body.data,
    };

    // caremanagement create is multipart: a JSON "request" part + an optional "attachments" file list.
    // It stores each file as its own attachment and also generates a combined sammanstallning.pdf.
    const form = new FormData();
    form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    (files ?? []).forEach(file => {
      form.append('attachments', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    });

    const created = await this.caremanagementApiService.postForm<unknown>({
      url: caremanagementUrl('errands', slug),
      data: form,
    });

    const errandId = errandIdFromLocation(created.location);
    if (!errandId) {
      logger.error(`[economic-aid] create (${slug}) returned no Location header (partyId=${req.user.partyId})`);
      throw new HttpException(502, 'Errand was created but no id was returned from caremanagement');
    }

    logger.info(
      `[economic-aid] created ${slug} errand ${errandId} with ${files?.length ?? 0} attachment(s) for partyId=${req.user.partyId}`,
    );

    // Mirror any edited contact details/notification preferences back to each person's
    // contactsettings. Best-effort — a failure here must never undo a created errand.
    await this.syncContactSettings(body.data, req);

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

  /** Resolves a batch of personnummer to their partyIds (UUID) via Citizen. */
  private async resolvePartyIds(personalNumbers: string[], req: RequestWithUser): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const clean = Array.from(new Set(personalNumbers.map(onlyDigits).filter(Boolean)));
    if (clean.length === 0) return result;
    try {
      const res = await this.apiService.post<PersonGuidBatch[], string[]>(
        { url: `${this.citizenApiBase}/${MUNICIPALITY_ID}/guid/batch`, data: clean },
        req.user,
      );
      (res?.data ?? []).forEach(entry => {
        if (entry?.success && entry.personId && entry.personNumber) {
          result.set(onlyDigits(entry.personNumber), entry.personId);
        }
      });
    } catch (err) {
      logger.warn(`[economic-aid] failed to resolve partyIds via Citizen: ${(err as Error)?.message ?? err}`);
    }
    return result;
  }

  /** Resolves a single personnummer to its partyId (UUID) via Citizen. Null when not found. */
  private async resolvePartyId(personalNumber: string, req: RequestWithUser): Promise<string | null> {
    if (!personalNumber) return null;
    const map = await this.resolvePartyIds([personalNumber], req);
    return map.get(onlyDigits(personalNumber)) ?? null;
  }

  /**
   * Translates the typed payload's persons[]/children[] from personnummer to partyId in place.
   * The applicant uses the session partyId; everyone else is resolved via Citizen. The raw
   * personnummer is removed so it never reaches caremanagement (which keys on partyId).
   */
  private async resolvePartyIdsOnPayload(data: Record<string, unknown>, req: RequestWithUser): Promise<void> {
    const persons = Array.isArray(data?.persons) ? (data.persons as Array<Record<string, unknown>>) : [];
    const children = Array.isArray(data?.children) ? (data.children as Array<Record<string, unknown>>) : [];

    const toResolve: string[] = [];
    persons.forEach(person => {
      if (person?.role !== 'APPLICANT' && typeof person?.personalNumber === 'string') toResolve.push(person.personalNumber);
    });
    children.forEach(child => {
      if (!child?.partyId && typeof child?.personalNumber === 'string') toResolve.push(child.personalNumber);
    });

    const map = toResolve.length > 0 ? await this.resolvePartyIds(toResolve, req) : new Map<string, string>();

    persons.forEach(person => {
      if (person?.role === 'APPLICANT') {
        person.partyId = req.user.partyId;
      } else if (typeof person?.personalNumber === 'string') {
        const partyId = map.get(onlyDigits(person.personalNumber));
        if (partyId) person.partyId = partyId;
      }
      delete person.personalNumber;
    });

    children.forEach(child => {
      if (!child?.partyId && typeof child?.personalNumber === 'string') {
        const partyId = map.get(onlyDigits(child.personalNumber));
        if (partyId) child.partyId = partyId;
      }
      delete child.personalNumber;
    });
  }

  /**
   * Speglar varje persons kontaktuppgifter/notisval (från ansökningspayloaden) tillbaka till
   * deras contactsettings. Körs efter att ärendet skapats och är best-effort: ett fel per person
   * loggas men fäller varken övriga personer eller själva inskicket. Personer utan partyId eller
   * utan ifyllda kontaktuppgifter hoppas över.
   */
  private async syncContactSettings(data: Record<string, unknown>, req: RequestWithUser): Promise<void> {
    const persons = Array.isArray(data?.persons) ? (data.persons as Array<Record<string, unknown>>) : [];
    for (const person of persons) {
      const partyId = typeof person?.partyId === 'string' ? person.partyId : '';
      if (!partyId) continue;
      const desired = buildManagedChannels(person);
      if (desired.length === 0) continue;
      try {
        await this.upsertContactSettings(partyId, desired, req);
      } catch (err) {
        logger.warn(`[economic-aid] contactsettings sync failed for partyId=${partyId}: ${(err as Error)?.message ?? err}`);
      }
    }
  }

  /**
   * Creates the person's contactsettings when missing, otherwise patches it — but only when the
   * managed EMAIL/SMS channels actually differ, so an unchanged form does not trigger a write.
   */
  private async upsertContactSettings(partyId: string, desired: ContactSettingChannel[], req: RequestWithUser): Promise<void> {
    const settingsUrl = `${this.contactSettingsApiBase}/${MUNICIPALITY_ID}/settings`;
    const res = await this.apiService.get<ContactSetting[]>({ url: settingsUrl, params: { partyId } }, req.user);
    const existing = res?.data?.[0];

    if (!existing) {
      const body: NewContactSettings = {
        alias: 'default',
        partyId,
        createdById: req.user.partyId,
        contactChannels: desired,
      };
      await this.apiService.post<ContactSetting, NewContactSettings>({ url: settingsUrl, data: body }, req.user);
      logger.info(`[economic-aid] created contactsettings for partyId=${partyId}`);
      return;
    }

    if (managedChannelsUnchanged(existing.contactChannels, desired)) return;

    const body: UpdateContactSettings = { alias: existing.alias ?? 'default', contactChannels: desired };
    await this.apiService.patch<ContactSetting, UpdateContactSettings>({ url: `${settingsUrl}/${existing.id}`, data: body }, req.user);
    logger.info(`[economic-aid] updated contactsettings for partyId=${partyId}`);
  }

  /** Reads the applicant's e-post + telefon from contactsettings (best-effort). */
  private async fetchContactDetails(partyId: string, req: RequestWithUser): Promise<{ epost: string | null; telefon: string | null }> {
    try {
      const url = `${getApiBase('contactsettings')}/${MUNICIPALITY_ID}/settings`;
      const res = await this.apiService.get<ContactSetting[]>({ url, params: { partyId } }, req.user);
      const setting = res?.data?.[0];
      if (!setting) return { epost: null, telefon: null };
      const client = makeClientContactSetting(setting);
      return { epost: client.email || null, telefon: client.phone || null };
    } catch (err) {
      logger.warn(`[economic-aid] failed to fetch contact settings for partyId=${partyId}: ${(err as Error)?.message ?? err}`);
      return { epost: null, telefon: null };
    }
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
