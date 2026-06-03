'use client';

import { Button, FormErrorMessage, Icon, Link } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardElevated } from '../../components/cards/card-elevated.component';
import { RepresentingMode } from '../../interfaces/app';
import { CenterDiv } from '../../layouts/center-div.component';
import { EntryLayout } from '../../layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { appURL } from '../../utils/app-url';
import { getAdjustedPathname, getRepresentingModeRoute } from '../../utils/representingModeRoute';
import { AlertBanner } from '@layouts/alert-banner.component';

function Login() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'login']);
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
            setErrorMessage(t('common:login.error.missingGroups'));
            break;
          case 'NOT_AUTHORIZED':
            break;
          case 'SAML_MISSING_ATTRIBUTES':
            setErrorMessage(t('common:login.error.missingAttributes'));
            break;
          case 'MISSING_PERMISSIONS':
            setErrorMessage(t('common:login.error.missingPermissions'));
            break;
          default:
            setErrorMessage(t('common:login.error.login'));
            break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EntryLayout title={t('common:logIn')}>
      <div className="w-full max-w-[64rem]">
        <CardElevated>
          <Main>
            <CenterDiv className="py-24 gap-y-40">
              {isLoggedOut ? (
                <>
                  <div className="flex flex-col w-full gap-12">
                    <h1 className="text-center text-h2-sm lg:text-h2-lg m-0">{t('common:logout.title')}</h1>
                  </div>

                  <div className="flex flex-col">
                    <Button variant="primary" color="vattjom" size="lg" onClick={() => router.push('/login')}>
                      {t('common:logout.loginAgain')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-center text-h2-sm lg:text-h2-lg mb-0">{t('common:login.title')}</h1>
                  <div className="flex flex-col desktop:flex-row gap-24 w-full desktop:w-fit">
                    <Button
                      variant="secondary"
                      size="lg"
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => onLogin(RepresentingMode.PRIVATE)}
                    >
                      {t('common:person')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => onLogin(RepresentingMode.BUSINESS)}
                    >
                      {t('common:organization')}
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
            <h2 className="text-h3-md">{t('login:loginProblems')}</h2>
            <p>
              {t('login:bankIdInfo')}{' '}
              <Link external href={url_e_identification}>
                {t('login:eIdentification')}
              </Link>
            </p>
            <h2 className="text-h3-md mt-30">{t('login:personalDataTitle')}</h2>
            <div>
              <span>
                {t('login:personalDataDescription')}
              </span>{' '}
              <Link external href={url_personal_data}>
                {t('login:personalDataLink')}
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
      <AlertBanner />
      <Login />
    </Suspense>
  );
}
