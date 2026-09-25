import { Asset } from '@/data-contracts/partyassets/data-contracts';
import { ServiceDetails } from '@/interfaces/asset.interface';
import { DocumentStatus, DOCUMENT_STATUSES, toCompositeId } from '@/interfaces/document.interface';
import { Owned } from '@/interfaces/owned';
import { findSourceErrandsForAsset } from '@/services/asset-relations.service';
import { fetchOwnedAssets, toClientAsset, toServiceDetails } from '@/services/asset.service';
import { User } from '@/interfaces/users.interface';
import { DocumentSourceAdapter, DocumentSourceContext, DocumentSourceResult, SourceDocument } from './document-source';

/**
 * partyassets as a document source.
 *
 * Every visible asset the party owns becomes one document. partyassets has no decisions of its
 * own: the decisions shown under an asset come from casedata, and the link between the two is the
 * LINK relation from the errand to the asset. Each document carries the ids of the errands linked
 * to it, which is what the aggregator matches decisions on.
 */

const SOURCE = 'PARTYASSETS' as const;

const toDocumentStatus = (status?: Asset['status']): DocumentStatus | undefined =>
  status && (DOCUMENT_STATUSES as readonly string[]).includes(status) ? (status as DocumentStatus) : undefined;

export const assetTitle = (asset: Pick<Asset, 'description' | 'type'>, service?: ServiceDetails): string =>
  service?.restyp?.length ? service.restyp.join(', ') : asset.description || asset.type || '';

export const toDocument = (asset: Owned<Asset>, service?: ServiceDetails, linkedErrandIds: string[] = []): SourceDocument => ({
  id: toCompositeId(SOURCE, asset.id as string),
  source: SOURCE,
  title: assetTitle(asset, service),
  status: toDocumentStatus(asset.status),
  issued: asset.issued,
  validTo: asset.validTo,
  decisions: [],
  matchKeys: linkedErrandIds,
  asset: { ...toClientAsset(asset), service },
});

/**
 * The ids of the errands linked to the asset. A failed relations lookup is already logged by the
 * relations service and comes back empty, so the asset still renders, only without its decisions.
 */
const linkedErrandIds = async (asset: Owned<Asset>, user: User): Promise<string[]> => {
  const errands = await findSourceErrandsForAsset(asset, user);
  return errands.map(errand => errand.id);
};

const fetch = async (ctx: DocumentSourceContext): Promise<DocumentSourceResult> => {
  const assets = await fetchOwnedAssets(ctx.partyId, ctx.user, ctx.signal);
  const documents = await Promise.all(
    assets.map(async asset => {
      const [service, errandIds] = await Promise.all([toServiceDetails(asset, ctx.user), linkedErrandIds(asset, ctx.user)]);
      return toDocument(asset, service, errandIds);
    }),
  );

  return { documents, decisions: [] };
};

export const partyassetsSource: DocumentSourceAdapter = {
  source: SOURCE,
  fetch,
};
