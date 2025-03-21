import CaseTabLayout from '@layouts/pages/mypages-sections/cases/case/case-tab-layout.component';
import { appName } from '@utils/app-name';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ externalCaseId: string; currentTab: string }>;
}) {
  const { externalCaseId, currentTab } = await params;
  return {
    title: `${currentTab} - ${externalCaseId} - Ärenden - Företag - ${appName()}`,
  };
}

export default async function CurrentTab({ params }) {
  const { externalCaseId, currentTab } = await params;
  if (!externalCaseId) {
    return null;
  }
  return <CaseTabLayout externalCaseId={externalCaseId} currentTab={currentTab} />;
}
