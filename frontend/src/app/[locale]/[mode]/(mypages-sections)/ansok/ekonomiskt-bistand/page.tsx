import { ApplicationFlowLayout } from '@layouts/pages/applications/application-flow-layout.component';
import { EconomicAidApplication } from '@layouts/pages/economic-aid/economic-aid-application.component';

export default function EkonomisktBistandPage() {
  return (
    <ApplicationFlowLayout>
      <EconomicAidApplication />
    </ApplicationFlowLayout>
  );
}
