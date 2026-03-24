import { PagesLayout } from '@layouts/pages-layout.component';
import { DecisionsAndDocuments } from '@layouts/pages/mypages-sections/decicions-and-documents/decisions-and-documents.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Beslut och dokument - Privat - ${appName()}`,
  };
}

export default function Index() {
  return (
    <PagesLayout>
      <DecisionsAndDocuments />
    </PagesLayout>
  );
}
