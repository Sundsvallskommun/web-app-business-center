import Head from 'next/head';
import { Link, CookieConsent, Header, Footer, UserMenu, Spinner } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { userMenuGroups } from './userMenuGroups';
import { useAppContext } from '@contexts/app.context';
import { NotificationsAlert } from '@components/notifications-alert/notifications-alert.component';
import Image from 'next/image';
// import NB_logo from '../../public/nb_logo_morning.png';
import NB_logo from '../../public/svg/NB_logo.svg';
import SK_logo from '../../public/svg/SK_logo.svg';
import { useLocalStorageValue } from '@react-hookz/web';
import AlertBannerWrapper from '@components/alert-banner/alert-banner-wrapper.component';

export default function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { representingEntity } = useAppContext();
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');
  const initialFocus = useRef(null);
  const [mounted, setMounted] = useState(false);

  const setInitialFocus = () => {
    setTimeout(() => {
      initialFocus.current && initialFocus.current.focus();
    });
  };

  const cookieConsentHandler = (cookies) => {
    if (cookies.some((opt) => opt.cookieName === 'stats')) {
      setMatomo(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    setInitialFocus();
  }, []);

  if (!mounted || !representingEntity.orgNumber) {
    return (
      <main>
        <div className="w-screen h-screen flex place-items-center place-content-center">
          <Spinner size="lg" aria-label="Laddar information" />
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Mina Sidor Företag" />
        <meta name="theme-color" content="#00538a"></meta>
        <meta name="msapplication-navbutton-color" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
      </Head>

      <NextLink href="#content" legacyBehavior passHref>
        <a
          onClick={() => setInitialFocus()}
          accessKey="s"
          className="sr-only focus:not-sr-only bg-primary-light border-2 border-black p-4 text-black inline-block focus:absolute focus:top-0 focus:left-0 focus:right-0 focus:m-auto focus:w-80 text-center"
        >
          Hoppa till innehåll
        </a>
      </NextLink>

      <AlertBannerWrapper />

      <Header
        title={`Mina sidor företag`}
        notificationsAlert={<NotificationsAlert />}
        userMenu={<UserMenu menuTitle={representingEntity.orgName} menuSubTitle="" menuGroups={userMenuGroups} />}
        LogoLinkWrapperComponent={<NextLink href={'/'} legacyBehavior passHref />}
      />

      {children}

      <CookieConsent
        title="Kakor på minasidor.foretagscentersundsvall.se"
        body={
          <p>
            Vi använder kakor, cookies, för att ge dig en förbättrad upplevelse, sammanställa statistik och för att viss
            nödvändig funktionalitet ska fungera på webbplatsen.{' '}
            <NextLink href="/kakor" legacyBehavior passHref>
              <Link>Läs mer om hur vi använder kakor</Link>
            </NextLink>
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: 'Nödvändiga kakor',
            description:
              'Dessa kakor är nödvändiga för att webbplatsen ska fungera och kan inte stängas av i våra system.',
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: 'Kakor för statistik',
            description:
              'Dessa kakor tillåter oss att räkna besök och trafikkällor, så att vi kan mäta och förbättra prestanda på vår webbplats.',
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={cookieConsentHandler}
      />

      <Footer
        color="gray"
        bottomLinks={
          <>
            <NextLink passHref legacyBehavior href={'/tillganglighet'}>
              <Link>Tillgänglighetsredogörelse</Link>
            </NextLink>
            <NextLink passHref legacyBehavior href={'/personuppgifter'}>
              <Link>Behandling av personuppgifter</Link>
            </NextLink>
            <NextLink passHref legacyBehavior href={'/kakor'}>
              <Link>Om kakor (Cookies)</Link>
            </NextLink>
          </>
        }
      >
        <div className="flex justify-between md:gap-32">
          <Image className="h-[40px] xs:h-[42px]  w-auto" src={SK_logo} alt="Sundsvalls Kommun logotyp" />
          <Image className="h-[42px] xs:h-[45px] w-auto mt-1" src={NB_logo} alt="Näringslivsbolagets logotyp" />
        </div>

        <div className="footer-contact mt-8 md:mt-0 md:ml-32">
          <h2 className="text-base leading-lg hidden md:block">Kontakt</h2>
          <div className="mt-12 md:mt-1 text-sm">
            Epost:{' '}
            <Link href="mailto:naringslivsbolaget@sundsvall.se" className="text-white">
              naringslivsbolaget@sundsvall.se
            </Link>
          </div>
        </div>
      </Footer>
    </>
  );
}
