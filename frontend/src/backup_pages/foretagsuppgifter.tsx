import Wrapper from '@components/wrapper/wrapper';
import { useEffect, useRef } from 'react';
import InformationSection from '@components/information/information.component';
import Layout from '@components/layout/layout.component';
import { useAppContext } from '@contexts/app.context';
import ContentCard from '@components/content-card/content-card';
import TabMenu from '@components/tabs/tab-menu.component';

export const Foretagsuppgifter: React.FC = () => {
  const { representingEntity, user } = useAppContext();

  const initialFocus = useRef(null);

  const setInitialFocus = () => {
    setTimeout(() => {
      initialFocus.current && initialFocus.current.focus();
    });
  };

  useEffect(() => {
    setInitialFocus();
  }, [user]);

  return (
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Företagsuppgifter`}>
        <main className="flex-grow bg-gray-lighter pb-20 lg:pt-20 lg:px-lg">
          <div className="container m-auto">
            <TabMenu />
          </div>
          <div className={`block mt-10 lg:mt-20`}>
            <div className="container m-auto px-0">
              <div className="flex flex-col lg:flex-row justify-around">
                <header className="lg:hidden mx-md mb-md">
                  <div className="flex justify-between">
                    <h1 className="text-lg">Företagsuppgifter</h1>
                    <span className="text-gray flex justify-between items-center">
                      {/* <HelpTooltip ariaLabel={'Labeltext'}>Infotext</HelpTooltip> */}
                    </span>
                  </div>
                </header>
                <div className="flex-grow w-full lg:w-1/2 flex flex-col">
                  <div className="flex-shrink">
                    <ContentCard>
                      <InformationSection orgInfo={representingEntity} user={user} />
                    </ContentCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
};

export default Foretagsuppgifter;
