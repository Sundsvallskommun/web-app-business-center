import Wrapper from '@components/wrapper/wrapper';
import Layout from '@components/layout/layout.component';
import NextLink from 'next/link';
import { Link } from '@sk-web-gui/react';
import ContentCard from '@components/content-card/content-card';

export const Personuppgifter: React.FC = () => {
  return (
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Personuppgifter`}>
        <main className="flex-grow bg-gray-lighter pb-20 lg:px-lg">
          <div className="container m-auto px-0 py-lg mb-lg">
            <ContentCard>
              <div className="text-content mb-11">
                <h1>Behandling av personuppgifter</h1>
                <p className="ingress">
                  Dataskyddsförordningen (GDPR) ställer höga krav på hantering av personuppgifter och vilka rättigheter
                  den registrerade har.
                </p>
                <p>
                  Dataskyddsförordningen (GDPR) har till syfte att skydda den grundläggande mänskliga rättigheten,
                  rätten till ett privatliv. Den personliga integriteten ska inte kränkas i samband med behandlingen av
                  personuppgifter. Sundsvalls kommun behandlar personuppgifter för att kunna fullgöra sina skyldigheter
                  och åtaganden mot invånare, fastighetsägare, näringsidkare och myndigheter.
                </p>
                <p>
                  Så fort en personuppgift hanteras så kallas det att personuppgiften behandlas. Det kan vara att den
                  samlas in, registreras, lagras, ändras eller raderas. Lagen gäller när personuppgifter hanteras med
                  hjälp av it-stöd. Personuppgifter som endast finns i pappersform och aldrig blir digital omfattas inte
                  av dataskyddsförordningen.
                </p>
                <NextLink
                  passHref
                  legacyBehavior
                  href="https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter"
                >
                  <Link external>Läs mer om hur personuppgifterna behandlas på Sundsvall.se</Link>
                </NextLink>
              </div>
            </ContentCard>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
};

export default Personuppgifter;
