import CaseTabLayout, { CaseCurrentTab } from '@layouts/pages/mypages-sections/cases/case/case-tab-layout.component';

export default async function CurrentTab({ params }: { params: Promise<{ caseId: string; currentTab?: string[] }> }) {
  const { caseId, currentTab } = await params;
  if (!caseId) {
    return null;
  }

  return <CaseTabLayout caseId={caseId} currentTab={(currentTab?.[0] ?? CaseCurrentTab.UPPGIFTER) as string} />;
}
