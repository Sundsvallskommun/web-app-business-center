'use client';

import AlertBannerWrapper from '@components/alert-banner/alert-banner-wrapper.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { CookieConsent, Footer, Icon, Link, Logo } from '@sk-web-gui/react';
import Head from 'next/head';
import NextLink from 'next/link';

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');

  const cookieConsentHandler = (cookies) => {
    if (cookies.some((opt) => opt.cookieName === 'stats')) {
      setMatomo(true);
    }
  };

  const setFocusToMain = () => {
    const contentElement = document.getElementById('content');
    contentElement?.focus();
  };

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
              <a target="_blank" href={'https://sundsvall.se'}>
                <Logo aria-label="Sundsvalls kommun logotyp" />
              </a>
            </Footer.LogoWrapper>
            <Footer.ListWrapper className="ml-80 gap-x-80 [&_.sk-footer-list-item]:w-full">
              <Footer.List>
                <Footer.ListItem>
                  <label>Kontakta oss</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'tel:+4660191000'}>
                    <Link variant="tertiary">060-19 10 00</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref legacyBehavior href={'mailto:kontakt@sundsvall.se'}>
                    <Link variant="tertiary">kontakt@sundsvall.se</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>Organisationsnummer: 212000-2411</span>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
                <Footer.ListItem>
                  <label>Besök oss</label>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>Sundsvalls kommun</span>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>Norrmalmsgatan 4, 851 85 Sundsvall</span>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>
                    Kommunhuset:{' '}
                    <Link
                      className="text-body"
                      href="https://sundsvall.se/kommun-och-politik/kommunfakta/kommunhuset---oppettider-och-karta"
                      external
                    >
                      Öppettider och karta
                    </Link>
                  </span>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
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
                  <NextLink
                    passHref
                    legacyBehavior
                    href={
                      'https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter'
                    }
                  >
                    <Link variant="tertiary" external>
                      Personuppgifter
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
