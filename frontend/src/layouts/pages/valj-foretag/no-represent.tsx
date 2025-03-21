import EmptyLayout from '@layouts/empty-layout.component';
import { Button, Link } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { appURL } from '../../../utils/app-url';

export const NoRepresent: React.FC = ({}) => {
  const router = useRouter();

  const onLogout = () => {
    // NOTE: send user to logout with SSO
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout?successRedirect=${`${appURL()}/login?loggedout`}`); // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return (
    <EmptyLayout title="Företagscenter Mina Sidor - Logga In">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-[68rem] p-20 shadow-lg">
          <div className="mb-14">
            <h1 className="text-xl">Hoppsan, vi hittade inget företag som är registrerat på dig</h1>

            <p className="my-0">
              När du loggar in en gör vi en kontroll mot Bolagsverket och Skatteverket, men vi fick ingen träff på ditt
              personnummer.
            </p>
            <p className="my-0">
              Du kan läsa mer om hur vi hämtar information och hur kontrollen fungerar i våra{' '}
              <Link href="https://naringslivsbolaget.se/nu-lanserar-vi-mina-sidor-for-dig-som-foretagare/" external>
                frågor och svar på naringslivsbolaget.se.
              </Link>
            </p>
          </div>

          <Button className="w-full" onClick={() => onLogout()} data-cy="loginButton">
            Logga ut
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
};
