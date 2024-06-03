'use client';

import { Button, FormErrorMessage } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import EmptyLayout from '../../components/empty-layout/empty-layout.component';
import { appName } from '../../utils/app-name';
import { appURL } from '../../utils/app-url';
import { useSearchParams } from 'next/navigation';

function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  const isLoggedOut = searchParams.get('loggedout') === '';
  const failMessage = searchParams.get('failMessage');

  // Turn on/off automatic login
  const autoLogin = false;

  const onLogin = () => {
    // NOTE: send user to login with SSO
    const path = new URLSearchParams(window.location.search).get('path') || '';
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/login?successRedirect=${`${appURL()}${path}`}`);
  };

  useEffect(() => {
    setTimeout(() => setMounted(true), 500); // to not flash the login-screen on autologin
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
    router.replace('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <EmptyLayout title={`${appName()} - Logga In`}>
        <main>
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-[80rem] bg-background-content p-20 shadow-lg">
              <div className="mb-14">
                <h1>Mina sidor företag</h1>
                <p>
                  I Mina sidor för företagare finns en översikt av de ärenden som ditt företag har kopplat till
                  Sundsvalls kommun. För att kunna se företagets ärenden behöver du vara firmatecknare, styrelseledamot
                  eller revisor.
                </p>
              </div>

              <Button className="w-full" color="primary" onClick={() => onLogin()} data-cy="loginButton">
                Logga in
              </Button>

              {errorMessage && <FormErrorMessage className="mt-lg">{errorMessage}</FormErrorMessage>}
            </div>
          </div>
        </main>
      </EmptyLayout>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
