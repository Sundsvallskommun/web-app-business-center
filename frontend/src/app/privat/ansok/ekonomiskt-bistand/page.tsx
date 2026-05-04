import { ApplicationFlowLayout } from '@layouts/pages/applications/application-flow-layout.component';
import { EconomicAidApplication } from '@layouts/pages/economic-aid/economic-aid-application.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Ansökan om ekonomiskt bistånd - Privat - ${appName()}`,
  };
}

export default function EkonomisktBistandPage() {
  return (
    <ApplicationFlowLayout>
      <EconomicAidApplication />
    </ApplicationFlowLayout>
  );
}
