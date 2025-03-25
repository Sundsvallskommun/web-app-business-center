import { PagesLayout } from '@layouts/pages-layout.component';
import { Profile } from '@layouts/pages/mypages-sections/profile/profile.component';
import { appName } from '@utils/app-name';

export async function generateMetadata() {
  return {
    title: `Profil - Företag - ${appName()}`,
  };
}

export default function Profil() {
  return (
    <PagesLayout>
      <Profile />
    </PagesLayout>
  );
}
