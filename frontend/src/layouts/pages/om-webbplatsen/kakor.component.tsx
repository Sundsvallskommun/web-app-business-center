'use client';

import { Breadcrumb, Button, CookieConsentUtils } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Kakor() {
  const { t } = useTranslation(['cookies', 'about']);

  const handleCookies = () => {
    CookieConsentUtils.resetConsent();
    location.reload();
  };

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb className="">
          <Breadcrumb.Item>
            <NextLink href='/om-webbplatsen'>
              <Breadcrumb.Link variant="body" as="span" href='/om-webbplatsen'>
                {t('about:title')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href='/om-webbplatsen/kakor'>{t('cookies:title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{t('cookies:title')}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">{t('cookies:intro')}</div>
          <div>
            <p>
              {t('cookies:whatIsCookie')}
            </p>
            <p>
              {t('cookies:necessaryCookies')}
            </p>
            <p>
              {t('cookies:analyticalCookies')}
            </p>
            <p>
              {t('cookies:externalCookies')}
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('cookies:ourNecessaryCookies')}</h2>
            <p>
              {t('cookies:cookieConsent.name')}
              <br />
              {t('cookies:cookieConsent.usedBy')}
              <br />
              {t('cookies:cookieConsent.type')}
              <br />
              {t('cookies:cookieConsent.description')}
            </p>
            <p>
              {t('cookies:sessionCookie.name')}
              <br />
              {t('cookies:sessionCookie.type')}
              <br />
              {t('cookies:sessionCookie.description')}
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('cookies:ourAnalyticalCookies')}</h2>
            <p>
              {t('cookies:matomo.name')}
              <br />
              {t('cookies:matomo.type')}
              <br />
              {t('cookies:matomo.description')}
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('cookies:manageCookies')}</h2>
            <p className="my-16">
              {t('cookies:manageCookiesDescription')}
            </p>
            <Button className="mt-16" color="vattjom" onClick={handleCookies}>
              {t('cookies:manageCookiesLink')}
            </Button>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
