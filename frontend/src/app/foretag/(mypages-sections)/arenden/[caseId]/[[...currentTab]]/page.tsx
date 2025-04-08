import CaseTabLayout from '@layouts/pages/mypages-sections/cases/case/case-tab-layout.component';
import { appName } from '@utils/app-name';

export async function generateMetadata({ params }: { params: Promise<{ caseId: string; currentTab: string }> }) {
  const { caseId, currentTab } = await params;
  return {
    title: `${currentTab} - ${caseId} - Ärenden - Företag - ${appName()}`,
  };
}

export default async function CurrentTab({ params }) {
  const { caseId, currentTab } = await params;
  if (!caseId) {
    return null;
  }
  return <CaseTabLayout caseId={caseId} currentTab={currentTab} />;
}
