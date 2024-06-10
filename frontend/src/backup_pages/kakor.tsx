import Layout from '@components/layout/layout.component';
import React from 'react';
import { Button } from '@sk-web-gui/react';
import Wrapper from '@components/wrapper/wrapper';
import ContentCard from '@components/content-card/content-card';

export default function cookies() {
  const cookiePopupHandler = () => {
    document.cookie = 'SKCookieConsent=; Max-Age=-99999999;';
    location.reload();
  };

  return (
    <Wrapper>
      <Layout title="Företagscenter Mina Sidor - Om kakor (Cookies)">
        <main className="flex-grow bg-gray-lighter pb-20 lg:px-lg">
          <div className="container m-auto px-0 py-lg mb-lg">
            <ContentCard>
              <div className="text-content mb-11">
                <h1>Om kakor (cookies)</h1>
                <p className="ingress">När du besöker Mina sidor Företag lagras kakor på din dator.</p>
                <p>
                  En kaka är en textfil som används för att förenkla ditt besök på vår webbplats och göra det möjligt
                  att använda vissa funktioner. Webbplatsen använder inga kakor som sparar personlig information om dig.
                </p>
                <p>Vi använder två olika typer av kakor: Nödvändiga och analytiska kakor.</p>
                <p>
                  <strong>Nödvändiga kakor</strong> lagras tillfälligt i din dator och förbättrar din
                  användarupplevelse. Dessa kakor kallas för sessionskakor och försvinner när du stänger webbläsaren.
                </p>
                <p>
                  <strong>Analytiska kakor</strong> används för att analysera och förstå hur du använder webbplatsen.
                  Dessa kakor sparar vi bara om vi får ditt samtycke. Dessa kakor kan lagras under en längre tid på din
                  dator, en så kallad permanent kaka.
                </p>
                <p>Du kan ta bort kakor i din webbläsare.</p>
              </div>
              <Button variant="solid" color="primary" onClick={cookiePopupHandler}>
                Visa Kakor-popup igen
              </Button>
            </ContentCard>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
}
