'use client';

import { useAppContext } from '@contexts/app.context';
import { MessageResponse } from '@data-contracts/case-data/data-contracts';
import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { ICaseStatusResponse } from '@interfaces/case';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { handleCase } from '@services/case-service';
import { Breadcrumb } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { AxiosError } from 'axios';
import { redirect } from 'next/navigation';
import NextLink from 'next/link';
import { createContext, useEffect } from 'react';

/** @ts-expect-error is set on mount */
export const CaseContext = createContext<{ caseData?: ICaseStatusResponse; caseMessages?: MessageResponse[] }>(null);

export default function CaseLayout(props: { caseId: number; children: React.ReactNode }) {
  const { caseId, children } = props;
  const { data: caseData, error: caseError } = useApi<CaseStatusResponse, AxiosError, ICaseStatusResponse>({
    url: `/cases/${caseId}`,
    method: 'get',
    dataHandler: handleCase,
  });

  const {
    data: caseMessages,
    refetch: refetchMessages,
    error: caseMessagesError,
  } = useApi<MessageResponse[], AxiosError>({
    url: `/cases/${caseData?.caseId}/messages`,
    method: 'get',
    queryOptions: {
      enabled: caseData?.caseId ? true : false,
    },
  });

  useEffect(() => {
    if (caseData?.caseId) {
      refetchMessages();
    }
  }, [caseData?.caseId, refetchMessages]);

  const { representingMode } = useAppContext();

  if (caseError?.status === 404 || caseMessagesError?.status === 404) {
    redirect(`${getRepresentingModeRoute(representingMode)}/arenden`);
  }

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden`}>
              <Breadcrumb.Link variant="body" as="span">
                Ärenden
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="#">{caseData?.caseType}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <CaseContext.Provider
        value={{
          caseData: caseData,
          caseMessages: caseMessages,
        }}
      >
        {children}
      </CaseContext.Provider>
    </PagesBreadcrumbsLayout>
  );
}
