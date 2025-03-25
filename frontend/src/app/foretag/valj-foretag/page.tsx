import ValjForetag from '@layouts/pages/valj-foretag/valj-foretag.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Välj företag - Företag - ${appName()}`,
  };
}

export default function Index() {
  return <ValjForetag />;
}
