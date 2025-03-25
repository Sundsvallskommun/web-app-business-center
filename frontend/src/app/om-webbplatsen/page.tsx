import OmWebbplatsen from '@layouts/pages/om-webbplatsen/index.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Om webbplatsen - ${appName()}`,
  };
}

export default function Index() {
  return <OmWebbplatsen />;
}
