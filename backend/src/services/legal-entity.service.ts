import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import ApiService from './api.service';
import { logger } from '@/utils/logger';
import { Mandates } from '@/data-contracts/myrepresentatives/data-contracts';

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
  const apiBase = getApiBase('legalentity');
  const apiService = new ApiService();
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/person/${user.personNumber}`;

  let res: { data: PersonEngagement[] };

  try {
    res = await apiService.get<PersonEngagement[]>({ url }, user);
  } catch (error) {
    logger.error('Could not get engagements', error);
    res = { data: [] };
  }

  try {
    await addEngagementFromMandate(user, apiService, apiBase, res);
  } catch (error) {
    logger.error('Could not add engagements from mandate', error);
  }

  return res.data ?? [];
};

const addEngagementFromMandate = async (
  user: User,
  apiService: ApiService,
  apiBase: string,
  res: {
    data: PersonEngagement[];
  },
) => {
  const mandateApiUrl = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;
  const mandateParams = {
    granteePartyId: user.partyId,
  };
  try {
    const mandateRes = await apiService.get<Mandates>({ url: mandateApiUrl, params: mandateParams }, user);

    if (mandateRes?.data?.mandateDetailsList && mandateRes.data.mandateDetailsList.length > 0) {
      await Promise.all(
        mandateRes.data.mandateDetailsList.map(async m => {
          if (!m.grantorDetails) return;
          const url = `${apiBase}/${MUNICIPALITY_ID}/${m.grantorDetails.grantorPartyId}`;
          const companyByGrantor = await apiService.get<LegalEntity2>({ url }, user);

          const engagement: PersonEngagement = {
            organizationNumber: companyByGrantor.data?.organizationNumber ?? '',
            name: companyByGrantor.data?.name ?? '',
            isAuthorizedSignatory: false,
            isSoleTrader: null,
          };
          res.data.push(engagement);
        }),
      );
    }
  } catch (error) {
    logger.error('Error getting engagement: ', error);
    throw new HttpException(500, 'Error getting engagement');
  }
};
