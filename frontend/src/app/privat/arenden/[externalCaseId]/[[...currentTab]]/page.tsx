'use client';

import CaseTabLayout from '@components/mypages-sections/cases/case/case-tab-layout.component';

export default function CurrentTab({ params }) {
  return <CaseTabLayout externalCaseId={params.externalCaseId} currentTab={params.currentTab} />;
}
