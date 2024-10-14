'use client';

import { Card, LucideIcon } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../layouts/pages-breadcrumbs-layout.component';

export default function OmWebbplatsen() {
  return (
    <PagesBreadcrumbsLayout>
      <h1>Om webbplatsen</h1>
      <div>
        Jorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet
        odio mattis.
      </div>
      <div className="mt-56 flex flex-col large-device:flex-row gap-24 justify-start text-body">
        <Card useHoverEffect href="/om-webbplatsen/kakor" layout="horizontal">
          <Card.Body>
            <Card.Header>
              <h2>Kakor (cookies)</h2>
            </Card.Header>
            <Card.Text>
              <p>
                Amet enim adipiscing congue justo adipiscing sagittis volutpat nibh ac. Integer viverra lectus in
                quisque. In nisl mauris faucibus egestas quis mi nam.
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
                Amet enim adipiscing congue justo adipiscing sagittis volutpat nibh ac. Integer viverra lectus in
                quisque. In nisl mauris faucibus egestas quis mi nam.
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
                Personuppgifter <LucideIcon size={24} className="!pl-0" name="external-link" />
              </h2>
            </Card.Header>
            <Card.Text>
              <p>
                Amet enim adipiscing congue justo adipiscing sagittis volutpat nibh ac. Integer viverra lectus in
                quisque. In nisl mauris faucibus egestas quis mi nam.
              </p>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
