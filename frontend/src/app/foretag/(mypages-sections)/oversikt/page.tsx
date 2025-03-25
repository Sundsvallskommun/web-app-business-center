import { PagesLayout } from '@layouts/pages-layout.component';
import Overview from '@layouts/pages/mypages-sections/overview.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Översikt - Företag - ${appName()}`,
  };
}

export default function Oversikt() {
  return (
    <PagesLayout>
      <Overview />
    </PagesLayout>
  );
}
