'use client';

import { useAppContext } from '@contexts/app.context';
import { Asset } from '@data-contracts/partyassets/data-contracts';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { Breadcrumb } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { AxiosError } from 'axios';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { createContext } from 'react';

export const AssetsContext = createContext<{
  assetData?: Asset;
}>(
  /** @ts-expect-error is set on mount */
  null
);

export default function AssetLayout(props: { id: string; children: React.ReactNode }) {
  const { id, children } = props;
  const { data: assetData, error: assetError } = useApi<Asset, AxiosError>({
    url: `/assets/${id}`,
    method: 'get',
  });

  const { representingMode } = useAppContext();

  if (assetError?.status === 404) {
    redirect(`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument`);
  }

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
            <Breadcrumb.Link href="#">{assetData?.description}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <AssetsContext.Provider
        value={{
          assetData,
        }}
      >
        {children}
      </AssetsContext.Provider>
    </PagesBreadcrumbsLayout>
  );
}
