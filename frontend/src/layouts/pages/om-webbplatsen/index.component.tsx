'use client';

import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Card, Icon } from '@sk-web-gui/react';
import { ExternalLink } from 'lucide-react';

export default function OmWebbplatsen() {
  return (
    <PagesBreadcrumbsLayout>
      <h1>Om webbplatsen</h1>
      <div>
        Här hittar du information om hur webbplatsen fungerar, vår användning av kakor, tillgänglighet samt hur vi
        hanterar personuppgifter.
      </div>
      <div className="mt-56 flex flex-col large-device:flex-row gap-24 justify-start text-body">
        <Card useHoverEffect href="/om-webbplatsen/kakor" layout="horizontal">
          <Card.Body>
            <Card.Header>
              <h2>Kakor (cookies)</h2>
            </Card.Header>
            <Card.Text>
              <p>På den här webbplatsen använder vi kakor (cookies). Läs mer om kakor.</p>
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
              <h2>Tillgänglighet</h2>
            </Card.Header>
            <Card.Text>
              <p>Vi strävar efter att vår webbplats ska vara tillgänglig för alla. Läs mer om webbtillgänglighet.</p>
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
                Personuppgifter <Icon size={24} className="!pl-0" icon={<ExternalLink />} />
              </h2>
            </Card.Header>
            <Card.Text>
              <p>Här kan du läsa om hur vi behandlar dina personuppgifter.</p>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
