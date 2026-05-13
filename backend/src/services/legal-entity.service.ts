import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import ApiService from './api.service';

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
      organizationName: e?.name,
      organizationNumber: e?.organizationNumber,
      isAuthorizedSignatory: e?.isAuthorizedSignatory ?? false,
    }));
};
