import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import ApiService from './api.service';
import { logger } from '@/utils/logger';
import { GrantorDetails, MandateDetails, Mandates } from '@/data-contracts/myrepresentatives/data-contracts';

export interface Engagement {
  organizationName?: string;
  organizationNumber?: string;
  isAuthorizedSignatory?: boolean;
}

const apiService = new ApiService();
const apiBase = getApiBase('legalentity');

export const getGuid = async (organizationNumber: string, user: User): Promise<string> => {
  const guidUrl = `${apiBase}/${MUNICIPALITY_ID}/${organizationNumber}/guid`;
  const guidRes = await apiService.get<string>({ url: guidUrl }, user);

  if (!guidRes.data) {
    throw new HttpException(404, 'Not Found');
  }

  return guidRes.data;
};

export const getLegalEntity = async (guid: string, user: User): Promise<LegalEntity2> => {
  const url = `${apiBase}/${MUNICIPALITY_ID}/${guid}`;
  const res = await apiService.get<LegalEntity2>({ url }, user);

  if (!res.data) {
    throw new HttpException(404, 'Not Found');
  }

  return res.data;
};

const mapLegalEntityToBusinessInformation = (legalEntity: LegalEntity2): ClientBusinessInformation => {
  if (!legalEntity) {
    return {};
  }
  const address = legalEntity?.postAddress;
  return {
    companyLocation: {
      city: address?.city ?? '',
      street: address?.address1 ?? '',
      postcode: address?.postalCode ?? '',
      careOf: address?.coAdress ?? '',
    },
  };
};

export const getBusinessInformationByGuid = async (guid: string, user: User): Promise<ClientBusinessInformation> => {
  const legalEntity = await getLegalEntity(guid, user);
  return mapLegalEntityToBusinessInformation(legalEntity);
};

export const getBusinessInformation = async (organizationNumber: string, user: User): Promise<ClientBusinessInformation> => {
  const guid = await getGuid(organizationNumber, user);
  return getBusinessInformationByGuid(guid, user);
};

export const mapEngagements = (engagements: PersonEngagement[]): Engagement[] => {
  return engagements
    .filter(e => e?.name && e?.organizationNumber)
    .map(e => ({
      organizationName: e?.name ?? '',
      organizationNumber: e?.organizationNumber ?? '',
      isAuthorizedSignatory: e?.isAuthorizedSignatory ?? false,
    }));
};

export const getBusinessEngagements = async (user: User): Promise<PersonEngagement[]> => {
  if (!user.personNumber) {
    throw new Error('Bad Request: personalNumber is required');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/person/${user.personNumber}`;

  let personEngagements: PersonEngagement[] = [];
  try {
    const res = await apiService.get<PersonEngagement[]>({ url }, user);
    personEngagements = res.data ?? [];
  } catch (error) {
    logger.error('Could not get engagements', error);
  }

  let mandateEngagements: PersonEngagement[] = [];
  try {
    mandateEngagements = await getEngagementsFromMandates(user);
  } catch (error) {
    logger.error('Could not add engagements from mandate', error);
  }

  return dedupeByOrganizationNumber([...personEngagements, ...mandateEngagements]);
};

const getEngagementsFromMandates = async (user: User): Promise<PersonEngagement[]> => {
  if (!user.partyId) {
    return [];
  }

  const mandateApiUrl = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;
  const mandateRes = await apiService.get<Mandates>({ url: mandateApiUrl, params: { granteePartyId: user.partyId } }, user);

  const mandates = (mandateRes?.data?.mandateDetailsList ?? []).filter((m): m is MandateDetails & { grantorDetails: GrantorDetails } =>
    Boolean(m.grantorDetails),
  );
  if (mandates.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    mandates.map(async m => {
      const url = `${apiBase}/${MUNICIPALITY_ID}/${m.grantorDetails.grantorPartyId}`;
      const companyByGrantor = await apiService.get<LegalEntity2>({ url }, user);
      const engagement: PersonEngagement = {
        organizationNumber: companyByGrantor.data?.organizationNumber ?? '',
        name: companyByGrantor.data?.name ?? '',
        isAuthorizedSignatory: false,
        isSoleTrader: null,
      };
      return engagement;
    }),
  );

  return results.filter((r): r is PromiseFulfilledResult<PersonEngagement> => r.status === 'fulfilled').map(r => r.value);
};

const dedupeByOrganizationNumber = (engagements: PersonEngagement[]): PersonEngagement[] => {
  const seen = new Set<string>();
  return engagements.filter(e => {
    if (!e.organizationNumber) {
      return true;
    }
    if (seen.has(e.organizationNumber)) {
      return false;
    }
    seen.add(e.organizationNumber);
    return true;
  });
};
