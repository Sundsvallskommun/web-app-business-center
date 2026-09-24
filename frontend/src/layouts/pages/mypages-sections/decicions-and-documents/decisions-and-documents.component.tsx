'use client';

import { DocumentsOverview } from '@data-contracts/backend/data-contracts';
import { useApi } from '@services/api-service';
import { getSourceUnavailableMessage, getUnavailableSources } from '@services/document-service';
import { Alert, Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { UnlinkedDecisions } from './decisions.component';
import { Documents } from './documents.component';

export const DecisionsAndDocuments = () => {
  const { t } = useTranslation('decisions');
  const {
    data: overview,
    isFetching,
    isError,
  } = useApi<DocumentsOverview>({
    url: '/documents',
    method: 'get',
  });

  const documents = overview?.documents ?? [];
  const unlinkedDecisions = overview?.unlinkedDecisions ?? [];
  const unavailableSources = getUnavailableSources(overview?.sources);
  const isEmpty = !isFetching && !isError && documents.length === 0 && unlinkedDecisions.length === 0;

  return (
    <div>
      <h1>{t('decisions:title')}</h1>
      <p className="my-0">{t('decisions:description')}</p>
      <p className="my-0">{t('decisions:pendingCaseInfo')}</p>
      <div className="mt-40">
        {isFetching ? (
          <div className="flex items-center">
            <p className="text-secondary">{t('decisions:loadingDocuments')}</p>
            <Spinner className="ml-10" size={2} />
          </div>
        ) : null}
        {isError ? <p role="alert">{t('decisions:loadError')}</p> : null}
        {unavailableSources.length > 0 ? (
          <Alert data-cy="documents-source-unavailable" className="mb-24">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Content.Title>{getSourceUnavailableMessage(unavailableSources, t)}</Alert.Content.Title>
            </Alert.Content>
          </Alert>
        ) : null}
        {isEmpty ? <p>{t('decisions:noDocuments')}</p> : null}
        <Documents documents={documents} />
        <UnlinkedDecisions decisions={unlinkedDecisions} />
      </div>
    </div>
  );
};
