import { useEffect, useRef } from 'react';
import EmptyLayout from '@components/empty-layout/empty-layout.component';
import { useRouter } from 'next/router';
import { Link, Button } from '@sk-web-gui/react';

export const NoRepresent: React.FC = ({}) => {
  const router = useRouter();

  const initalFocus = useRef(null);
  const setInitalFocus = () => {
    setTimeout(() => {
      initalFocus.current && initalFocus.current.focus();
    });
  };

  const onLogout = () => {
    // NOTE: send user to logout with SSO
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout`);
  };

  useEffect(() => {
    setInitalFocus();
  }, []);

  return (
    <>
      <EmptyLayout title="Företagscenter Mina Sidor - Logga In">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-[68rem] w-full flex flex-col bg-white p-20 shadow-lg text-left">
            <div className="mb-14">
              <h1 className="mb-10 text-xl">Hoppsan, vi hittade inget företag som är registrerat på dig</h1>

              <p className="my-0">
                När du loggar in en gör vi en kontroll mot Bolagsverket och Skatteverket, men vi fick ingen träff på
                ditt personnummer.
              </p>
              <p className="my-0">
                Du kan läsa mer om hur vi hämtar information och hur kontrollen fungerar i våra{' '}
                <Link href="https://naringslivsbolaget.se/nu-lanserar-vi-mina-sidor-for-dig-som-foretagare/" external>
                  frågor och svar på naringslivsbolaget.se.
                </Link>
              </p>
            </div>

            <Button
              // rightIcon={<Image src={bankIdSVG} alt="bankid" height={42} width={42} />}
              variant="solid"
              color="primary"
              size="lg"
              className="rounded-md"
              onClick={() => onLogout()}
              ref={initalFocus}
              data-cy="loginButton"
            >
              Logga ut
            </Button>
          </div>
        </div>
      </EmptyLayout>
    </>
  );
};
