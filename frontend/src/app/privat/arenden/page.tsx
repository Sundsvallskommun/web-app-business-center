import { PagesLayout } from '@layouts/pages-layout.component';
import Cases from '@layouts/pages/mypages-sections/cases.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Ärenden - Privat - ${appName()}`,
  };
}

export default function Arenden() {
  return (
    <PagesLayout>
      <Cases />
    </PagesLayout>
  );
}
