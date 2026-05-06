'use client';

import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Card, Icon } from '@sk-web-gui/react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OmWebbplatsen() {
  const { t } = useTranslation('about');

  return (
    <PagesBreadcrumbsLayout>
      <h1>{t('about:title')}</h1>
      <div>
        {t('about:description')}
      </div>
      <div className="mt-56 flex flex-col large-device:flex-row gap-24 justify-start text-body">
        <Card useHoverEffect href='/om-webbplatsen/kakor' layout="horizontal">
          <Card.Body>
            <Card.Header>
              <h2>{t('about:cookies.title')}</h2>
            </Card.Header>
            <Card.Text>
              <p>{t('about:cookies.description')}</p>
            </Card.Text>
          </Card.Body>
        </Card>
        {/* Uncomment when tillganglighet.component.tsx is updated with new information */}
        {/* <Card useHoverEffect  href="/om-webbplatsen/tillganglighet" layout="horizontal"> */}
        <Card
          useHoverEffect
          target="_blank"
          href={`https://sundsvall.se/kommun/kommun-och-politik/om-webbplatsen/om-mina-sidor/tillganglighetsredogorelse-mina-sidor`}
          layout="horizontal"
        >
          <Card.Body>
            <Card.Header>
              <h2>{t('about:accessibility.title')}</h2>
            </Card.Header>
            <Card.Text>
              <p>{t('about:accessibility.description')}</p>
            </Card.Text>
          </Card.Body>
        </Card>
        <Card
          useHoverEffect
          target="_blank"
          href={`https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter`}
          layout="horizontal"
        >
          <Card.Body>
            <Card.Header>
              <h2>
                {t('about:personalData.title')} <Icon size={24} className="!pl-0" icon={<ExternalLink />} />
              </h2>
            </Card.Header>
            <Card.Text>
              <p>{t('about:personalData.description')}</p>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
