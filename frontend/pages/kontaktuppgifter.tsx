import ContentCard from '@components/content-card/content-card';
import Layout from '@components/layout/layout.component';
import TabMenu from '@components/tabs/tab-menu.component';
import { HelpTooltip } from '@components/tooltip/help-tooltip.component';
import Wrapper from '@components/wrapper/wrapper';
import { useEffect, useRef } from 'react';

export default function Kontaktuppgifter() {
  const initialFocus = useRef(null);

  const setInitialFocus = () => {
    setTimeout(() => {
      initialFocus.current && initialFocus.current.focus();
    });
  };

  useEffect(() => {
    setInitialFocus();
  }, []);
  return (
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Kontaktuppgifter`}>
        <main className="flex-grow bg-gray-lighter pb-20 lg:pt-20 lg:px-lg">
          <div className="container m-auto">
            <TabMenu />
          </div>
          <div className={`block mt-10 lg:mt-20`}>
            <div className="container m-auto px-0">
              <div className="flex flex-col lg:flex-row justify-around">
                <header className="lg:hidden mx-md mb-md">
                  <div className="flex justify-between">
                    <h1 className="text-lg">Kontaktuppgifter</h1>
                    <span className="text-gray flex justify-between items-center">
                      <HelpTooltip ariaLabel={'Labeltext'}>Infotext</HelpTooltip>
                    </span>
                  </div>
                </header>
                <div className="flex-grow w-full lg:w-1/2 flex flex-col">
                  <div className="flex-shrink">
                    <ContentCard>Kontaktuppgifter</ContentCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
}
