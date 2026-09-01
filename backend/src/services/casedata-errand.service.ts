import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Errand } from '@/data-contracts/case-data/data-contracts';
import { CaseDataNamespace, StakeholderRole } from '@/interfaces/casedata.interface';
import { User } from '@/interfaces/users.interface';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { apiURL, isSameUuid } from '@/utils/util';

const defaultApi = new ApiService();

/**
 * Intentionally more narrow than `allowedNamespaces` in case.service.ts
 */
const READABLE_NAMESPACES: ReadonlySet<string> = new Set([CaseDataNamespace.SBK_PARKING_PERMIT]);

const isReadableNamespace = (namespace: string): boolean => READABLE_NAMESPACES.has(namespace);

/**
 * Verify that the logged in user is the APPLICANT stakeholder of the retrieved errand
 *
 * @param errand errand to verify ownership of
 * @param partyId partyId of the entity the caller represents
 * @returns true if partyId matches the errand's single APPLICANT stakeholder personId, else false
 */
const isUserOwned = (errand: Errand, partyId: string): boolean => {
  const errandOwners = errand?.stakeholders?.filter(s => s?.roles?.includes(StakeholderRole.APPLICANT)) ?? [];
  if (errandOwners?.length !== 1) {
    logger.error(`Errand ${errand?.id} contains zero or multiple APPLICANT stakeholders. Rejecting lookup.`);
    return false;
  }
  return isSameUuid(errandOwners?.[0]?.personId, partyId);
};

/**
 * Fetch errand by id and namespace, and verify that the session user is the errand
 * APPLICANT stakeholder before returning it.
 *
 * @param errandId Id of the errand
 * @param namespace Namespace to fetch errand from
 * @param partyId partyId of the entity the caller represents, as resolved by the calling endpoint
 * @param user user object from request
 * @param api injected API service
 * @returns the `Errand`, or `undefined` if the id or namespace is not readable, the errand was not
 * found, or it does not belong to `partyId`. Never throws.
 */
export const fetchErrandById = async (
  errandId: string,
  namespace: string,
  partyId: string,
  user: User,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<Errand | undefined> => {
  if (!errandId) return undefined;

  if (!isReadableNamespace(namespace)) {
    logger.error(`Refusing to read errand ${errandId} from namespace ${namespace}`);
    return undefined;
  }

  const baseURL = apiURL(getApiBase('case-data'));
  const url = `${MUNICIPALITY_ID}/${namespace}/errands/${errandId}`;

  try {
    const res = await api.get<Errand>({ url, baseURL }, user);
    if (!res.data) {
      logger.error(`Error when fetching errand ${errandId} in namespace ${namespace}.`);
      return undefined;
    }
    if (!isUserOwned(res.data, partyId)) {
      logger.error(`Errand ${errandId} in namespace ${namespace} does not belong to user.`);
      return undefined;
    }
    return res.data;
  } catch (error) {
    logger.error(`Failed to fetch errand ${namespace}/${errandId}: `, error);
    return undefined;
  }
};
