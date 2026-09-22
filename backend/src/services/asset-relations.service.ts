import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Asset } from '@/data-contracts/partyassets/data-contracts';
import { Relation, RelationPagedResponse } from '@/data-contracts/relations/data-contracts';
import { Owned } from '@/interfaces/owned';
import { User } from '@/interfaces/users.interface';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { isSameUuid } from '@/utils/util';

const defaultApi = new ApiService();

const LINK_RELATION_TYPE = 'LINK';

/**
 * Normalizes service name - to lowercase, strip dashes and underscores
 */
const normalizeService = (service?: string): string => (service ?? '').toLowerCase().replace(/[-_]/g, '');

/**
 * Verifies that the relation source has the correct service and type
 */
const isCaseSource = (relation: Relation): boolean => normalizeService(relation.source?.service) === 'casedata' && relation.source?.type === 'case';

/**
 * Verifies that the relation target has the correct service, type and resourceId
 */
const isTargetingAsset = (relation: Relation, assetId: string): boolean =>
  normalizeService(relation.target?.service) === 'partyassets' &&
  relation.target?.type === 'asset' &&
  isSameUuid(relation.target?.resourceId, assetId);

/**
 * Verifies the relation type, source and target
 */
const isErrandAssetLink = (relation: Relation, assetId: string): boolean =>
  relation.type === LINK_RELATION_TYPE && isCaseSource(relation) && isTargetingAsset(relation, assetId);

interface SourceErrandRef {
  id: string;
  namespace: string;
}

/**
 * Find relations of type LINK that have the asset id as target.
 *
 * The returned id and namespace can then be used to fetch the errand data.
 *
 * Takes `Owned<Asset>` because this walks from an asset id to an errand id without checking any
 * party itself: the caller has to have settled ownership of the asset first. The ref it returns is
 * deliberately unbranded — nothing here establishes that the errand belongs to anyone, which is
 * what `fetchErrandById` verifies before branding it.
 *
 * @param asset the asset to find relations for, whose ownership has been established
 * @param user user from request object
 * @returns `SourceErrandRef` for the related errand, or `undefined` when no relation links this
 * asset to a CaseData errand, or the relation is missing the errand id or namespace
 */
export const findSourceErrandForAsset = async (
  asset: Owned<Asset>,
  user: User,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<SourceErrandRef | undefined> => {
  const assetId = asset?.id;
  if (!assetId) return undefined;

  const filter = `target.resourceId%3A%27${encodeURIComponent(assetId)}%27`;
  const url = `${getApiBase('relations')}/${MUNICIPALITY_ID}/relations?filter=${filter}`;

  try {
    const res = await api.get<RelationPagedResponse>({ url }, user);
    const relations = res.data?.relations ?? [];

    const foreignTargets = relations.filter(relation => !isSameUuid(relation.target?.resourceId, assetId)).length;
    if (foreignTargets > 0) {
      logger.error(`Relations query for asset ${assetId} returned ${foreignTargets} relation(s) targeting other resources`);
    }

    const link = relations.find(relation => isErrandAssetLink(relation, assetId));
    if (!link) {
      return undefined;
    }

    if (!link.source.resourceId) {
      logger.warn(`Relation ${link.id} for asset ${assetId} carries no source errand id`);
      return undefined;
    }

    if (!link.source.namespace) {
      logger.warn(`Relation ${link.id} for asset ${assetId} carries no source namespace`);
      return undefined;
    }

    return {
      id: link.source.resourceId,
      namespace: link.source.namespace,
    };
  } catch (error) {
    logger.error(`Failed to fetch relations for asset ${assetId}: `, error);
    return undefined;
  }
};
