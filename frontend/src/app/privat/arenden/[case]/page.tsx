'use client';

import Case from '@components/mypages-sections/cases/case/case.component';

export default function Arende({ params }) {
  return <Case caseId={params.case} />;
}
