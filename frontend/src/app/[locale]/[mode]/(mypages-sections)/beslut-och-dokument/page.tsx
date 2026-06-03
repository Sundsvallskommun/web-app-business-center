import { PagesLayout } from '@layouts/pages-layout.component';
import { DecisionsAndDocuments } from '@layouts/pages/mypages-sections/decicions-and-documents/decisions-and-documents.component';

export default function Index() {
  return (
    <PagesLayout>
      <DecisionsAndDocuments />
    </PagesLayout>
  );
}
