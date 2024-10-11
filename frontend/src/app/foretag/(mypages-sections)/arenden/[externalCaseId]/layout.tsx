'use client';

import CaseLayout from '@components/mypages-sections/cases/case/case-layout.component';

export default function layout({ params, children }) {
  return <CaseLayout externalCaseId={params.externalCaseId}>{children}</CaseLayout>;
}
