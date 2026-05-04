import { PagesLayout } from '@layouts/pages-layout.component';
import { EServicesIndex } from '@layouts/pages/e-services/e-services-index.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Ansök - Privat - ${appName()}`,
  };
}

export default function AnsokIndexPage() {
  return (
    <PagesLayout>
      <EServicesIndex />
    </PagesLayout>
  );
}
