import { useAppContext } from '@contexts/app.context';
import { CaseResponse, ICase } from '@interfaces/case';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { handleCase } from '@services/case-service';
import { Breadcrumb } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { createContext } from 'react';

/** @ts-expect-error is set on mount */
export const CaseContext = createContext<{ caseData?: ICase }>(null);

export default function CaseLayout(props: { caseId: number; children: React.ReactNode }) {
  const { caseId, children } = props;
  const { data: caseData } = useApi<CaseResponse, Error, ICase>({
    url: `/cases/${caseId}`,
    method: 'get',
    dataHandler: handleCase,
  });
  const { representingMode } = useAppContext();
  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <Breadcrumb.Link href={`${getRepresentingModeRoute(representingMode)}/arenden`}>Ärenden</Breadcrumb.Link>
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
        }}
      >
        {children}
      </CaseContext.Provider>
    </PagesBreadcrumbsLayout>
  );
}
