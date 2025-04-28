'use client';

import { Button, FormErrorMessage, Icon } from '@sk-web-gui/react';
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
          case 'SAML_MISSING_ATTRIBUTES':
            setErrorMessage('Användaren saknar rätt attribut');
          case 'MISSING_PERMISSIONS':
            setErrorMessage('Användaren saknar rättigheter');
          default:
          //
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
              <h1 className="text-center text-h2-sm lg:text-h2-lg mb-0">Logga in som</h1>
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
                {errorMessage && <FormErrorMessage className="mt-lg">{errorMessage}</FormErrorMessage>}
              </div>
            </CenterDiv>
          </Main>
        </CardElevated>
        <div className="mt-48 text-left">
          <h2 className="text-h3-md">Problem att logga in?</h2>
          <p>
            Vi använder oss av BankID för en trygg och säker inloggning. BankID är en e-legitimation som du använder
            till att styrka din identitet på Internet, t.ex. på banken, hos Försäkringskassan eller CSN.
          </p>
        </div>
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
