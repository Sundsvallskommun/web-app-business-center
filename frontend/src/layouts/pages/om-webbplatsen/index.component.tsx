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
              <p>
                Vi använder kakor för att webbplatsen ska fungera, samla in statistik och ge dig en bättre upplevelse.
                Du kan välja vilka kakor du vill tillåta.
              </p>
            </Card.Text>
          </Card.Body>
        </Card>
        <Card useHoverEffect href="/om-webbplatsen/tillganglighet" layout="horizontal">
          <Card.Body>
            <Card.Header>
              <h2>Tillgänglighet</h2>
            </Card.Header>
            <Card.Text>
              <p>
                Vi vill att alla ska kunna använda webbplatsen. Här kan du läsa om vårt arbete, kända brister och hur du
                kontaktar oss vid tillgänglighetsproblem.
              </p>
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
              <p>
                Vi behandlar personuppgifter enligt GDPR och värnar om din integritet. Här kan du läsa mer om hur vi
                hanterar uppgifter och vilka rättigheter du har.
              </p>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
