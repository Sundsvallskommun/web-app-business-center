'use client';

import { Breadcrumb, Link } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';

const pageName = 'Tillgänglighet';

export default function Tillganglighet() {
  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb className="">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/om-webbplatsen">Om webbplatsen</Breadcrumb.Link>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="/om-webbplatsen/tillganglighet">{pageName}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{pageName}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">Här hittar du tillgänglighetsredogörelsen för Sundsvalls kommuns Mina sidor.</div>
          <div>
            <h2 className="text-h4-md">Tillgänglighet för minasidor.se</h2>
            <p>
              Tillgänglighetsredogörelsen beskriver hur sundsvall.se uppfyller lagen om tillgänglighet till digital
              offentlig service, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så
              att vi kan åtgärda dem.
            </p>
            <p>Webbplatsen offentliggjordes den 17 maj 2022.</p>
          </div>
          <div>
            <h2 className="text-h4-md">Hur tillgänglig är webbplatsen?</h2>
            <p>Delar av webbplatsen är inte helt tillgängliga.</p>
            <p>
              Länkarna nedan leder till avsnitt som beskriver vilka problem att uppfatta, hantera eller förstå
              webbplatsen du kan möta i olika situationer.
            </p>
            <ul>
              <li>
                <span className="underline">Utan synförmåga</span>
              </li>
              <li>
                <span className="underline">Utan synförmåga</span>
              </li>
              <li>
                <span className="underline">Utan synförmåga</span>
              </li>
              <li>
                <span className="underline">Utan synförmåga</span>
              </li>
              <li>
                <span className="underline">Utan synförmåga</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-h4-md">Rapportera brister i webbplatsens tillgänglighet</h2>
            <p className="my-16">
              Om du upptäcker problem som inte är beskrivna på den här sidan, eller om du anser att vi inte uppfyller
              lagens krav,{' '}
              <Link external href="https://e-tjanster.sundsvall.se/oversikt/overview/77">
                lämna synpunkt via Synpunkt Sundsvall
              </Link>{' '}
              så att vi får veta att problemet finns.
            </p>
            <p>Du kan också kontakta oss om digital tillgänglighet via:</p>
            <ul>
              <li>
                E-post: <Link href="mailto:sundsvalls.kommun@sundsvall.se">sundsvalls.kommun@sundsvall.se</Link>
              </li>
              <li>
                Telefon: <Link href="tel:+4660191000">060-19 10 00</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-h4-md">Tillsyn</h2>
            <p>
              Myndigheten för digital förvaltning har ansvaret för tillsyn över lagen om tillgänglighet till digital
              offentlig service.
            </p>
            <p>
              Om du inte är nöjd med hur vi hanterar ditt påpekande om bristande webbtillgänglighet eller din begäran om
              tillgängliggörande av innehåll kan du{' '}
              <Link external href="https://www.digg.se/tdosanmalan">
                anmäla till Myndigheten för digital förvaltning
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
