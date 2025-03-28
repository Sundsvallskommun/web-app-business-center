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
import NextLink from 'next/link';
import { createContext } from 'react';

/** @ts-expect-error is set on mount */
export const CaseContext = createContext<{ caseData?: ICaseStatusResponse; caseMessages?: MessageResponse[] }>(null);

export default function CaseLayout(props: { externalCaseId: number; children: React.ReactNode }) {
  const { externalCaseId, children } = props;
  const { data: caseData } = useApi<CaseStatusResponse, Error, ICaseStatusResponse>({
    url: `/cases/${externalCaseId}`,
    method: 'get',
    dataHandler: handleCase,
  });
  // waiting for api to implement
  // const { data: caseMessages } = useApi<MessageResponse[]>({
  //   url: `/case-data/messages/${caseData?.externalCaseId}`,
  //   method: 'get',
  // });

  const { representingMode } = useAppContext();
  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden`}>
              <Breadcrumb.Link as="span">Ärenden</Breadcrumb.Link>
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
          caseMessages: [], // TODO: caseMessages,
        }}
      >
        {children}
      </CaseContext.Provider>
    </PagesBreadcrumbsLayout>
  );
}
