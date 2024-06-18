'use client';

import AlertBannerWrapper from '@components/alert-banner/alert-banner-wrapper.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { CookieConsent, Footer, Icon, Link, Logo, Spinner } from '@sk-web-gui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { OrganisationInfo } from '../interfaces/organisation-info';
import { useApi } from '../services/api-service';

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { data: representingEntity } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');
  const [mounted, setMounted] = useState(false);

  const cookieConsentHandler = (cookies) => {
    if (cookies.some((opt) => opt.cookieName === 'stats')) {
      setMatomo(true);
    }
  };

  const setFocusToMain = () => {
    const contentElement = document.getElementById('content');
    contentElement?.focus();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !representingEntity?.organizationNumber) {
    return (
      <main>
        <div className="w-screen h-screen flex items-center justify-center">
          <Spinner aria-label="Laddar information" />
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
          onClick={setFocusToMain}
          accessKey="s"
          className="sr-only focus:not-sr-only bg-primary-light border-2 border-black p-4 text-black inline-block focus:absolute focus:top-0 focus:left-0 focus:right-0 focus:m-auto focus:w-80 text-center"
        >
          Hoppa till innehåll
        </a>
      </NextLink>

      <AlertBannerWrapper />

      <div className="root-container">
        {children}
        <Footer className="bg-background-200">
          <Footer.Content>
            <Footer.LogoWrapper>
              <Logo aria-label="Sundsvalls kommun logotyp" />
            </Footer.LogoWrapper>
            <Footer.ListWrapper>
              <Footer.List className="min-w-[19.3rem]">
                <Footer.ListItem>
                  <label>Kontakt</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'tel:+460611-xxxx'}>
                    <Link variant="tertiary">0611-xxxx</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'mailto:inkorg@sundsvall.se'}>
                    <Link variant="tertiary">inkorg@sundsvall.se</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>Norrmalmsgatan 4, 852 34 Sundsvall</span>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List className="min-w-[19.3rem]">
                <Footer.ListItem>
                  <label>Om innehållet</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'/om-webbplatsen'}>
                    <Link variant="tertiary">Om webbplatsen</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'/kakor'}>
                    <Link variant="tertiary">Kakor (Cookies)</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'/tillganglighet'}>
                    <Link variant="tertiary">Tillgänglighet</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'/personuppgifter'}>
                    <Link variant="tertiary">Personuppgifter</Link>
                  </NextLink>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List className="min-w-[19.3rem]">
                <Footer.ListItem>
                  <label>Följ oss</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'#'}>
                    <Link className="flex items-center gap-8" variant="tertiary">
                      <Icon name="facebook" />
                      <span>Facebook</span>
                    </Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'#'}>
                    <Link className="flex items-center gap-8" variant="tertiary">
                      <Icon name="instagram" />
                      <span>Instagram</span>
                    </Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'#'}>
                    <Link className="flex items-center gap-8" variant="tertiary">
                      <Icon name="linkedin" />
                      <span>Linkedin</span>
                    </Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'#'}>
                    <Link className="flex items-center gap-8" variant="tertiary">
                      <Icon name="youtube" />
                      <span>Youtube</span>
                    </Link>
                  </NextLink>
                </Footer.ListItem>
              </Footer.List>
            </Footer.ListWrapper>
          </Footer.Content>
        </Footer>
      </div>

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
    </>
  );
}
