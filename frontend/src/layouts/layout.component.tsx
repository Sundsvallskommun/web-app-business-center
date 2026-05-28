'use client';

import AlertBannerWrapper from '@components/alert-banner/alert-banner-wrapper.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { CookieConsent, Footer, Link, Logo } from '@sk-web-gui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');
  const { t } = useTranslation(['layout', 'common']);

  const cookieConsentHandler = (cookies: { cookieName: string }[]) => {
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
        <meta name="description" content={t('layout:title')} />
        <meta name="theme-color" content="#00538a"></meta>
        <meta name="msapplication-navbutton-color" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
      </Head>

      <NextLink
        href="#content"
        passHref
        onClick={setFocusToMain}
        accessKey="s"
        className="sr-only focus:not-sr-only bg-primary-light border-2 border-black p-4 text-black inline-block focus:absolute focus:top-0 focus:left-0 focus:right-0 focus:m-auto focus:w-80 text-center"
      >
        {t('layout:goToContent')}
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
            <Footer.ListWrapper className="desktop:ml-80 gap-x-80 [&_.sk-footer-list-item]:w-full">
              <Footer.List>
                <Footer.ListItem>
                  <label>{t('layout:contactUs')}</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <Link variant="tertiary" href={'tel:+4660191000'}>
                    {t('layout:phone')}
                  </Link>
                </Footer.ListItem>
                <Footer.ListItem>
                  <Link variant="tertiary" href={'mailto:kontakt@sundsvall.se'}>
                    {t('layout:email')}
                  </Link>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>{t('layout:organizationNumber')}</span>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
                <Footer.ListItem>
                  <label>{t('layout:visitUs')}</label>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>{t('layout:municipality')}</span>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>{t('layout:address')}</span>
                </Footer.ListItem>
                <Footer.ListItem className="w-full">
                  <span>
                    {t('layout:cityHall')}{' '}
                    <Link
                      className="text-body"
                      href="https://sundsvall.se/kommun-och-politik/kommunfakta/kommunhuset---oppettider-och-karta"
                      external
                    >
                      {t('layout:openingHoursAndMap')}
                    </Link>
                  </span>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
                <Footer.ListItem>
                  <label>{t('layout:aboutContent')}</label>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref href={'/om-webbplatsen'}>
                    <Link variant="tertiary">{t('layout:aboutWebsite')}</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink passHref href={'/om-webbplatsen/kakor'}>
                    <Link variant="tertiary">{t('layout:cookies')}</Link>
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  {/* Uncomment when tillganglighet.component.tsx is updated with new information */}
                  {/* <NextLink passHref href={'/om-webbplatsen/tillganglighet'}>
                    <Link variant="tertiary">{t('layout:accessibility')}</Link>
                  </NextLink> */}
                  <Link
                    variant="tertiary"
                    target="_blank"
                    href="https://sundsvall.se/kommun/kommun-och-politik/om-webbplatsen/om-mina-sidor/tillganglighetsredogorelse-mina-sidor"
                  >
                    {t('layout:accessibility')}
                  </Link>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink
                    passHref
                    href={
                      'https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter'
                    }
                  >
                    <Link variant="tertiary" external>
                      {t('layout:personalData')}
                    </Link>
                  </NextLink>
                </Footer.ListItem>
              </Footer.List>
            </Footer.ListWrapper>
          </Footer.Content>
        </Footer>
      </div>

      <CookieConsent
        title={t('layout:cookieBanner.title')}
        body={
          <p>
            {t('layout:cookieBanner.description')}{' '}
            <NextLink href={'/om-webbplatsen/kakor'} passHref>
              <Link>{t('layout:cookieBanner.readMore')}</Link>
            </NextLink>
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: t('layout:cookieBanner.necessary'),
            description: t('layout:cookieBanner.necessaryDescription'),
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: t('layout:cookieBanner.statistics'),
            description: t('layout:cookieBanner.statisticsDescription'),
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={cookieConsentHandler}
      />
    </>
  );
}
