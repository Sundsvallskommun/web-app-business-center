'use client';

import { Breadcrumb, Link } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Tillganglighet() {
  const { t } = useTranslation(['accessibility', 'about']);

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
            <Breadcrumb.Link href={t('accessibility:pageLink')}>{t('accessibility:title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{t('accessibility:title')}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">{t('accessibility:description')}</div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:subTitle')}</h2>
            <p>
              {t('accessibility:subDescription')}
            </p>
            <p>{t('accessibility:publishDate')}</p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:howAccessible')}</h2>
            <p>{t('accessibility:howAccessibleDescription')}</p>
            <p>
              {t('accessibility:howAccessibleProblemsIntro')}
            </p>
            <ul>
              <li>
                <span className="underline">{t('accessibility:howAccessibleWithoutVision')}</span>
              </li>
              <li>
                <span className="underline">{t('accessibility:howAccessibleWithoutVision')}</span>
              </li>
              <li>
                <span className="underline">{t('accessibility:howAccessibleWithoutVision')}</span>
              </li>
              <li>
                <span className="underline">{t('accessibility:howAccessibleWithoutVision')}</span>
              </li>
              <li>
                <span className="underline">{t('accessibility:howAccessibleWithoutVision')}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:reportTitle')}</h2>
            <p className="my-16">
              {t('accessibility:reportDescription')}{' '}
              <Link external href={t('accessibility:reportDescriptionUrl')}>
                {t('accessibility:reportDescriptionLink')}
              </Link>{' '}
              så att vi får veta att problemet finns.
            </p>
            <p>{t('accessibility:digitalReportContactTitle')}</p>
            <ul>
              <li>
                E-post: <Link href={t('accessibility:digitalReportContactEmailUrl')}>{t('accessibility:digitalReportContactEmail')}</Link>
              </li>
              <li>
                Telefon: <Link href={t('accessibility:digitalReportContactPhoneUrl')}>{t('accessibility:digitalReportContactPhone')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:oversight')}</h2>
            <p>
              {t('accessibility:oversightDescription')}
            </p>
            <p>
              {t('accessibility:oversightComplaint')}{' '}
              <Link external href={t('accessibility:oversightUrl')}>
                {t('accessibility:oversightLink')}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
