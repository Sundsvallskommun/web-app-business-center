import Asset from '@layouts/pages/mypages-sections/decicions-and-documents/asset.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Beslut och dokument - Företag - ${appName()}`,
  };
}

export default function Index() {
  return <Asset />;
}
