import Kakor from '@layouts/pages/om-webbplatsen/kakor.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Kakor - Om webbplatsen - ${appName()}`,
  };
}

export default function Index() {
  return <Kakor />;
}
