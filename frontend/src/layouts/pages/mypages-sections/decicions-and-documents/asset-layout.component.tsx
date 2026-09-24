'use client';

import { useAppContext } from '@contexts/app.context';
import { DocumentDetails } from '@data-contracts/backend/data-contracts';
import { AssetWithService } from '@interfaces/asset';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { Breadcrumb, Spinner } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { AxiosError } from 'axios';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { createContext } from 'react';
import { useTranslation } from 'react-i18next';

// `assetData` is the source payload of a partyassets document, kept under the name the
// parking permit flows already read. It is undefined for documents from other sources.
export const AssetsContext = createContext<{
  document?: DocumentDetails;
  assetData?: AssetWithService;
}>(
  /** @ts-expect-error is set on mount */
  null
);

export default function AssetLayout(props: { id: string; children: React.ReactNode }) {
  const { id, children } = props;
  const { t } = useTranslation('decisions');
  const {
    data: document,
    error: documentError,
    isPending,
  } = useApi<DocumentDetails, AxiosError>({
    url: `/documents/${id}`,
    method: 'get',
  });

  const { representingMode } = useAppContext();
  const assetData = document?.asset as AssetWithService | undefined;

  if (documentError?.status === 404) {
    redirect(`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument`);
  }

  const content = isPending ? (
    <div className="flex items-center" data-cy="document-loading">
      <p className="text-secondary">{t('decisions:loadingDocument')}</p>
      <Spinner className="ml-10" size={2} />
    </div>
  ) : documentError ? (
    <p role="alert">{t('decisions:loadDocumentError')}</p>
  ) : (
    children
  );

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href={`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument`}>
              <Breadcrumb.Link variant="body" as="span">
                Beslut och dokument
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="#">{document?.title}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <AssetsContext.Provider
        value={{
          document,
          assetData,
        }}
      >
        {content}
      </AssetsContext.Provider>
    </PagesBreadcrumbsLayout>
  );
}
