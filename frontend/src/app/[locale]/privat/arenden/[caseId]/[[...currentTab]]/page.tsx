import CaseTabLayout, { CaseCurrentTab } from '@layouts/pages/mypages-sections/cases/case/case-tab-layout.component';
import { appName } from '@utils/app-name';
import { capitalize } from 'lodash';

export async function generateMetadata({ params }: { params: Promise<{ caseId: string; currentTab: string }> }) {
  const { currentTab } = await params;
  return {
    title: `${capitalize(currentTab || 'uppgifter')} - Ärende - Privat - ${appName()}`,
  };
}

export default async function CurrentTab({ params }) {
  const { caseId, currentTab } = await params;
  if (!caseId) {
    return null;
  }
  return <CaseTabLayout caseId={caseId} currentTab={currentTab ?? CaseCurrentTab.UPPGIFTER} />;
}
