import { User } from '@interfaces/users.interface';
import ApiService from '@services/api.service';
import { getApiBase } from '@/config/api-config';
import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { Mandates } from '@/data-contracts/myrepresentatives/data-contracts';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';

/**
 * Fetches active mandate details for current user and selected organization
 * Returns true if user is whitelisted for current organization
 */
export const getIsWhitelisted = async (user: User, orgPartyId: string): Promise<boolean> => {
  if (!user.partyId || !orgPartyId) {
    throw new HttpException(400, 'Bad Request: Missing party ids');
  }

  const apiService = new ApiService();
  const mandateApiUrl = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;
  const mandateParams = {
    grantorPartyId: orgPartyId,
    granteePartyId: user.partyId,
    statuses: ['ACTIVE'],
  };

  try {
    const mandateRes = await apiService.get<Mandates>({ url: mandateApiUrl, params: mandateParams }, user);
    return mandateRes?.data?.mandateDetailsList?.some(entry => entry.whitelisted === true);
  } catch (error) {
    logger.error('Error getting engagement: ', error);
    // If the API is not available, default to not whitelisted rather than blocking the login
    return false;
  }
};
