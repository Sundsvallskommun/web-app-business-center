'use client';

import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { CasesData } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { emptyCaseList, casesHandler, getOngoing, getClosed } from '@services/case-service';
import { ClosedCases } from './cases/closed-cases/closed-cases.component';
import { OngoingCases } from './cases/ongoing-cases/ongoing-cases.component';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import FullscreenMainSpinner from '@components/spinner/fullscreen-main-spinner.component';

function Page() {
  const { t } = useTranslation('cases');
  const { data: cases = emptyCaseList, isFetching: isFetchingCases } = useApi<CaseStatusResponse[], Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
    queryKey: ['cases'],
  });

  return (
    <Suspense fallback={<FullscreenMainSpinner />}>
      <div className="flex flex-col gap-40">
        <div className="text-content">
          <h1>{t('cases:title')}</h1>
        </div>
        <div>
          <OngoingCases caseData={getOngoing(cases)} isFetchingCases={isFetchingCases} />
        </div>
        <div>
          <ClosedCases caseData={getClosed(cases)} isFetchingCases={isFetchingCases} />
        </div>
      </div>
    </Suspense>
  );
}

export default function Cases() {
  return (
    <Suspense fallback={<FullscreenMainSpinner />}>
      <Page />
    </Suspense>
  );
}
