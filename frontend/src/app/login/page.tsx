import LoginPage from '@layouts/pages/login.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Logga in - ${appName()}`,
  };
}

export default function Index() {
  return <LoginPage />;
}
