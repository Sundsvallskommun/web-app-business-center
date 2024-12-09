import { useAppContext } from '@contexts/app.context';
import { MessageResponse } from '@data-contracts/case-data/data-contracts';
import { CaseResponse, ICase } from '@interfaces/case';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { handleCase } from '@services/case-service';
import { Breadcrumb } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { createContext } from 'react';
import NextLink from 'next/link';

/** @ts-expect-error is set on mount */
export const CaseContext = createContext<{ caseData?: ICase; caseMessages?: MessageResponse[] }>(null);

export default function CaseLayout(props: { externalCaseId: number; children: React.ReactNode }) {
  const { externalCaseId, children } = props;
  const { data: caseData } = useApi<CaseResponse, Error, ICase>({
    url: `/cases/${externalCaseId}`,
    method: 'get',
    dataHandler: handleCase,
  });
  const { data: caseMessages } = useApi<MessageResponse[]>({
    url: `/case-data/messages/${caseData?.caseId}`,
    method: 'get',
  });
  console.log('caseMessages', caseMessages);
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
            <Breadcrumb.Link href="#">{caseData?.subject.caseType}</Breadcrumb.Link>
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
