import { User } from '@interfaces/users.interface';
import ApiService from '@services/api.service';
import { getApiBase } from '@/config/api-config';
import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { Mandates, SearchMandateParameters } from '@/data-contracts/myrepresentatives/data-contracts';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';

/**
 * Fetches active mandate details for current user and selected organization
 * Returns true if user is whitelisted for current organization
 */
const defaultApi = new ApiService();

export const getIsWhitelisted = async (user: User, orgPartyId: string, api: Pick<ApiService, 'get'> = defaultApi): Promise<boolean> => {
  if (!user.partyId || !orgPartyId) {
    throw new HttpException(400, 'Bad Request: Missing party ids');
  }

  const mandateApiUrl = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;
  const mandateParams = {
    grantorPartyId: orgPartyId,
    granteePartyId: user.partyId,
    statuses: ['ACTIVE'],
  };

  try {
    const mandateRes = await api.get<Mandates>({ url: mandateApiUrl, params: mandateParams }, user);
    return mandateRes?.data?.mandateDetailsList?.some(entry => entry.whitelisted === true) ?? false;
  } catch (error) {
    logger.error('Error getting engagement: ', error);
    // If the API is not available, default to not whitelisted rather than blocking the login
    return false;
  }
};

/**
 * Verify that a mandate belongs to the current user before it is deleted.
 *
 * The mandate id comes from the client. Without this check a logged-in user could swap
 * the id and soft-delete another party's mandate (IDOR). A mandate counts as the user's
 * own when they are the grantee, or when it was granted by the organization they
 * currently represent (grantor). Fails closed: any lookup error resolves to "not owned".
 */
export const mandateBelongsToUser = async (
  mandateId: string,
  user: User,
  representingBusinessPartyId: string | undefined,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<boolean> => {
  if (!mandateId || !user.partyId) {
    return false;
  }

  const url = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;

  const listContainsMandate = async (params: SearchMandateParameters): Promise<boolean> => {
    const res = await api.get<Mandates>({ url, params }, user);
    return res.data?.mandateDetailsList?.some(mandate => mandate.id === mandateId) ?? false;
  };

  try {
    // Granted to the user (grantee)…
    if (await listContainsMandate({ granteePartyId: user.partyId })) {
      return true;
    }
    // …or granted by the organization the user currently represents (grantor).
    if (representingBusinessPartyId && (await listContainsMandate({ grantorPartyId: representingBusinessPartyId }))) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error verifying mandate ownership: ', error);
    return false;
  }
};
