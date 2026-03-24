import Tillganglighet from '@layouts/pages/om-webbplatsen/tillganglighet.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Tillgänglighet - Om webbplatsen - ${appName()}`,
  };
}

export default function Index() {
  return <Tillganglighet />;
}
