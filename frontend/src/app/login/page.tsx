'use client';

import { Button, Divider, FormErrorMessage, MenuBar } from '@sk-web-gui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CardElevated } from '../../components/cards/card-elevated.component';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingMode } from '../../interfaces/app';
import { CenterDiv } from '../../layouts/center-div.component';
import { EntryLayout } from '../../layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { appURL } from '../../utils/app-url';
import { getAdjustedPathname, getRepresentingMode, getRepresentingModeRoute } from '../../utils/representingModeRoute';

function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const { representingMode, setRepresentingMode, isRepresentingModeBusiness, isRepresentingModePrivate } =
    useAppContext();

  const isLoggedOut = searchParams.get('loggedout') === '';
  const failMessage = searchParams.get('failMessage');

  // Turn on/off automatic login
  const autoLogin = false;

  const onLogin = () => {
    // NOTE: send user to login with SSO
    const path = searchParams.get('path') || '';
    const myPagesAdjustedPathname =
      getAdjustedPathname(path, representingMode) || getRepresentingModeRoute(representingMode);
    router.push(
      `${process.env.NEXT_PUBLIC_API_URL}/saml/login?successRedirect=${`${appURL()}${myPagesAdjustedPathname}&representingMode=${representingMode}`}`
    );
  };

  useEffect(() => {
    const path = searchParams.get('path') || '';
    const wantedRepresentingMode = getRepresentingMode(path);
    if (wantedRepresentingMode !== null) {
      setRepresentingMode(wantedRepresentingMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedOut) {
      //
    } else {
      if (!failMessage && autoLogin) {
        // autologin
        onLogin();
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
            <CenterDiv className="pt-24 px-8 pb-8">
              <div className="max-w-[34.7rem]">
                <h1 className="text-center text-h2-sm lg:text-h2-lg">Välj hur du vill logga in</h1>
                <MenuBar className="mt-24 self-stretch">
                  <MenuBar.Item current={isRepresentingModePrivate} className="flex items-center justify-center grow">
                    <Button className="w-full" onClick={() => setRepresentingMode(RepresentingMode.PRIVATE)}>
                      Privat
                    </Button>
                  </MenuBar.Item>
                  <MenuBar.Item current={isRepresentingModeBusiness} className="flex items-center justify-center grow">
                    <Button className="w-full" onClick={() => setRepresentingMode(RepresentingMode.BUSINESS)}>
                      Företag
                    </Button>
                  </MenuBar.Item>
                </MenuBar>
              </div>
            </CenterDiv>

            <Divider />

            <CenterDiv className="pt-40 px-[6.65rem] pb-64">
              <div className="w-full max-w-[34.7rem]">
                <Button size="lg" className="w-full" color="vattjom" onClick={() => onLogin()} data-cy="loginButton">
                  Logga in
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
