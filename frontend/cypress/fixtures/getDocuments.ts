import {
  Asset,
  DecisionItem,
  DocumentDetails,
  DocumentItem,
  DocumentsOverview,
} from '@data-contracts/backend/data-contracts';
import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getAssets } from './getAssets';

export const toDocumentId = (asset: Asset): string => `pa-${asset.id}`;

export const linkedDecision = (representingMode: RepresentingMode = representingModeDefault): DecisionItem => ({
  id: 'cd-1',
  source: 'CASEDATA',
  outcome: 'APPROVAL',
  decidedAt: '2024-01-15T10:30:00Z',
  validFrom: '2024-01-15T00:00:00Z',
  validTo: '2026-01-15T00:00:00Z',
  errandId: 10,
  errandNumber: 'assetId-0',
  attachments: [
    {
      id: 100,
      name: `beslut-${RepresentingMode[representingMode]}.pdf`,
      mimeType: 'application/pdf',
      extension: 'pdf',
    },
  ],
});

export const unlinkedDecision = (): DecisionItem => ({
  id: 'cd-2',
  source: 'CASEDATA',
  outcome: 'REJECTION',
  decidedAt: '2024-02-20T14:00:00Z',
  validFrom: '2024-02-20T00:00:00Z',
  errandId: 11,
  errandNumber: 'PRH-2024-000002',
  attachments: [],
});

export const toDocument = (asset: Asset, decisions: DecisionItem[] = []): DocumentItem => ({
  id: toDocumentId(asset),
  source: 'PARTYASSETS',
  title: asset.description ?? '',
  status: asset.status as DocumentItem['status'],
  issued: asset.issued,
  validTo: asset.validTo,
  decisions,
});

export const toDocumentDetails = (asset: Asset, decisions: DecisionItem[] = []): ApiResponse<DocumentDetails> => ({
  data: { ...toDocument(asset, decisions), asset },
  message: 'success',
});

export const BYGGR_CASE_NUMBER = 'BYGG 2024-000123';
export const BYGGR_DOCUMENT_ID = `br-${BYGGR_CASE_NUMBER}`;
export const BYGGR_DESCRIPTION = 'Nybyggnad av garage';

export const byggrMainDecision = (): DecisionItem => ({
  id: `br-101:${BYGGR_CASE_NUMBER}`,
  source: 'BYGGR',
  title: 'Beslut om bygglov',
  outcome: 'Bifall',
  decidedAt: '2024-03-01',
  validTo: '2029-03-01',
  mainDecision: true,
  attachments: [
    { id: 4711, name: 'Beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' },
    { id: 4712, name: 'Ritning.pdf', mimeType: 'application/pdf', extension: 'pdf' },
  ],
});

export const byggrStartDecision = (): DecisionItem => ({
  id: `br-102:${BYGGR_CASE_NUMBER}`,
  source: 'BYGGR',
  title: 'Startbesked',
  decidedAt: '2024-05-15',
  mainDecision: false,
  attachments: [{ id: 4713, name: 'Startbesked.pdf', mimeType: 'application/pdf', extension: 'pdf' }],
});

export const byggrListDocument = (): DocumentItem => ({
  id: BYGGR_DOCUMENT_ID,
  source: 'BYGGR',
  title: BYGGR_DESCRIPTION,
  status: 'ACTIVE',
  issued: '2024-03-01',
  validTo: '2029-03-01',
  decisions: [],
});

export const getByggrDocument = (): ApiResponse<DocumentDetails> => ({
  data: {
    ...byggrListDocument(),
    decisions: [byggrStartDecision(), byggrMainDecision()],
    byggr: { caseNumber: BYGGR_CASE_NUMBER, description: BYGGR_DESCRIPTION, propertyDesignation: 'SUNDSVALL 1:1' },
  },
  message: 'success',
});

export const getByggrDocumentWithoutDecisions = (): ApiResponse<DocumentDetails> => ({
  data: {
    id: BYGGR_DOCUMENT_ID,
    source: 'BYGGR',
    title: BYGGR_CASE_NUMBER,
    decisions: [],
    byggr: { caseNumber: BYGGR_CASE_NUMBER },
  },
  message: 'success',
});

export const getDocuments = (
  representingMode: RepresentingMode = representingModeDefault,
  assets: Asset[] = getAssets(representingMode).data
): ApiResponse<DocumentsOverview> => ({
  data: {
    documents: [
      ...assets.map((asset, index) => toDocument(asset, index === 0 ? [linkedDecision(representingMode)] : [])),
      byggrListDocument(),
    ],
    unlinkedDecisions: [unlinkedDecision()],
    sources: [
      { source: 'PARTYASSETS', status: 'OK' },
      { source: 'CASEDATA', status: 'OK' },
      { source: 'BYGGR', status: 'OK' },
    ],
  },
  message: 'success',
});

export const getDocumentsWithUnavailable = (
  unavailable: string[],
  representingMode: RepresentingMode = representingModeDefault
): ApiResponse<DocumentsOverview> => {
  const overview = getDocuments(representingMode);
  return {
    ...overview,
    data: {
      ...overview.data,
      sources: overview.data.sources.map((source) =>
        unavailable.includes(source.source) ? { ...source, status: 'UNAVAILABLE' } : source
      ),
    },
  };
};

export const getDocument = (representingMode: RepresentingMode = representingModeDefault) =>
  toDocumentDetails(getAssets(representingMode).data[0], [linkedDecision(representingMode)]);
