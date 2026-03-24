import { PagesLayout } from '@layouts/pages-layout.component';
import Invoices from '@layouts/pages/mypages-sections/invoices.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Fakturor - Privat - ${appName()}`,
  };
}

export default function Fakturor() {
  return (
    <PagesLayout>
      <Invoices />
    </PagesLayout>
  );
}
