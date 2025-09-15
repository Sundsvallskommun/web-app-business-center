'use client';

import { Button, FormErrorMessage, Icon, Link } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { CardElevated } from '../../components/cards/card-elevated.component';
import { RepresentingMode } from '../../interfaces/app';
import { CenterDiv } from '../../layouts/center-div.component';
import { EntryLayout } from '../../layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { appURL } from '../../utils/app-url';
import { getAdjustedPathname, getRepresentingModeRoute } from '../../utils/representingModeRoute';

function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();

  const isLoggedOut = searchParams?.get('loggedout') === '';
  const failMessage = searchParams?.get('failMessage');
  const url_e_identification = 'https://elegitimation.se';
  const url_personal_data =
    'https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter';

  // Turn on/off automatic login
  const autoLogin = false;

  const onLogin = useCallback(
    (representingMode: RepresentingMode) => {
      // NOTE: send user to login with SSO
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname =
        getAdjustedPathname(path, representingMode) || getRepresentingModeRoute(representingMode);
      router.push(
        `${process.env.NEXT_PUBLIC_API_URL}/saml/login?successRedirect=${`${appURL()}${myPagesAdjustedPathname}&representingMode=${representingMode}`}`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    if (isLoggedOut) {
      //
    } else {
      if (!failMessage && autoLogin) {
        // autologin
        onLogin(RepresentingMode.PRIVATE);
      } else if (failMessage) {
        switch (failMessage) {
          case 'SAML_MISSING_GROUP':
            setErrorMessage('Användaren saknar rätt grupper');
            break;
          case 'NOT_AUTHORIZED':
            break;
          case 'SAML_MISSING_ATTRIBUTES':
            setErrorMessage('Användaren saknar rätt attribut');
            break;
          case 'MISSING_PERMISSIONS':
            setErrorMessage('Användaren saknar rättigheter');
            break;
          default:
            setErrorMessage('Det gick inte att logga in, försök igen senare.');
            break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EntryLayout title="Logga in">
      <div className="w-full max-w-[64rem]">
        <CardElevated>
          <Main>
            <CenterDiv className="py-24 gap-y-40">
              {isLoggedOut ? (
                <>
                  <div className="flex flex-col w-full gap-12">
                    <h1 className="text-center text-h2-sm lg:text-h2-lg m-0">Du är nu utloggad</h1>
                  </div>

                  <div className="flex flex-col">
                    <Button variant="primary" color="vattjom" size="lg" onClick={() => router.push('/login')}>
                      Logga in igen
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-center text-h2-sm lg:text-h2-lg mb-0">Logga in på Mina sidor</h1>
                  <div className="flex flex-col desktop:flex-row gap-24 w-full desktop:w-fit">
                    <Button
                      variant="secondary"
                      size="lg"
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => onLogin(RepresentingMode.PRIVATE)}
                    >
                      Privatperson
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => onLogin(RepresentingMode.BUSINESS)}
                    >
                      Organisation
                    </Button>
                  </div>
                  {errorMessage && <FormErrorMessage className="text-error mt-lg">{errorMessage}</FormErrorMessage>}
                </>
              )}
            </CenterDiv>
          </Main>
        </CardElevated>
        {!isLoggedOut && (
          <div className="mt-48 text-left">
            <h2 className="text-h3-md">Problem att logga in?</h2>
            <p>
              Vi använder oss av BankID och FrejaID för en trygg och säker inloggning. BankID och FrejaID är en
              e-legitimationer som du använder till att styrka din identitet på Internet, t.ex. till exempel hos banken,
              hos Försäkringskassan eller CSN.
            </p>
            <div className="mt-10">
              <span>Du kan läsa mer om e-legitimation här.</span>{' '}
              <Link external href={url_e_identification}>
                E-legitimation
              </Link>
            </div>
            <h2 className="text-h3-md mt-30">Behandling av personuppgifter</h2>
            <div>
              <span>
                Här kan du läsa om hur dina personuppgifter behandlas när du använder våra e-tjänster och Mina Sidor.
              </span>{' '}
              <Link external href={url_personal_data}>
                Behandling av personuppgifter
              </Link>
            </div>
          </div>
        )}
      </div>
    </EntryLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
