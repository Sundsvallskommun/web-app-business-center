'use client';

import CaseTabLayout from '@components/mypages-sections/cases/case/case-tab-layout.component';

export default function CurrentTab({ params }) {
  return <CaseTabLayout caseId={params.caseId} currentTab={params.currentTab} />;
}
