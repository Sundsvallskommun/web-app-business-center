import CaseTabLayout, { CaseCurrentTab } from '@layouts/pages/mypages-sections/cases/case/case-tab-layout.component';

export default async function CurrentTab({ params }) {
  const { caseId, currentTab } = await params;
  if (!caseId) {
    return null;
  }

  return <CaseTabLayout caseId={caseId} currentTab={currentTab ?? CaseCurrentTab.UPPGIFTER} />;
}
