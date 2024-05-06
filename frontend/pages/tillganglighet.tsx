import Wrapper from '@components/wrapper/wrapper';
import Layout from '@components/layout/layout.component';
import ContentCard from '@components/content-card/content-card';

export const Tillganglighet: React.FC = () => {
  return (
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Tillgänglighetsredogörelse`}>
        <main className="flex-grow bg-gray-lighter pb-20 lg:px-lg">
          <div className="container m-auto px-0 py-lg mb-lg">
            <ContentCard>
              <div className="text-content mb-11">
                <h1>Tillgänglighet för Mina sidor Företag</h1>
                <p className="ingress">
                  Sundsvalls kommun står bakom den här webbplatsen. Vi vill att så många som möjligt ska kunna använda
                  den. Här beskriver vi hur Mina sidor Företag uppfyller lagen om tillgänglighet till digital offentlig
                  service, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så att vi
                  kan åtgärda dem.
                </p>
                <h2>Hur tillgänglig är webbplatsen?</h2>
                <p>Vi har inga kända brister i tillgängligheten för den här webbplatsen.</p>
                <h2>Vad kan du göra om du inte kan använda delar av webbplatsen?</h2>
                <p>
                  Om du behöver innehåll från Mina sidor Företag som inte är tillgängligt för dig, men som är undantaget
                  från lagens tillämpningsområde enligt beskrivning nedan, kan du kontakta oss via vårt kontaktformulär.
                </p>
                <h2>Rapportera brister i webbplatsens tillgänglighet</h2>
                <p>
                  Vi strävar hela tiden efter att förbättra webbplatsens tillgänglighet. Om du upptäcker problem som
                  inte är beskrivna på den här sidan, eller om du anser att vi inte uppfyller lagens krav, meddela oss
                  så att vi får veta att problemet finns. Använd vårt kontaktformulär så återkommer vi så snart vi kan.
                </p>
                <h2>Tillsyn</h2>
                <p>
                  Myndigheten för digital förvaltning har ansvaret för tillsyn över lagen om tillgänglighet till digital
                  offentlig service. Om du inte är nöjd med hur vi hanterar ditt påpekande om bristande
                  webbtillgänglighet eller din begäran om tillgängliggörande av innehåll kan du anmäla till Myndigheten
                  för digital förvaltning.
                </p>
                <h2>Teknisk information om webbplatsens tillgänglighet</h2>
                <p>Den här webbplatsen är helt förenlig med lagen om tillgänglighet till digital offentlig service.</p>
                <h2>Hur vi testat webbplatsen</h2>
                <p>Consid AB har gjort en oberoende granskning av Mina sidor Företag.</p>
                <p>Senaste bedömningen gjordes den 8 juni 2022</p>
                <p>Webbplatsen publicerades den 26 september 2022</p>
                <p>Redogörelsen uppdaterades senast den 26 september 2022.</p>
              </div>
            </ContentCard>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
};

export default Tillganglighet;
