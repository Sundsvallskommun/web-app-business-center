import Layout from '@components/layout/layout.component';
import MyOverviewSection from '@components/my-overview/my-overview.component';
import TabMenu from '@components/tabs/tab-menu.component';
import { WelcomeModal } from '@components/welcome/welcome-modal.component';
import Wrapper from '@components/wrapper/wrapper';
import { useAppContext } from '@contexts/app.context';
import HeaderImage from '@public/hero-bg.png';
import NB_logo from '@public/svg/NB_logo.svg';
import { useLocalStorageValue } from '@react-hookz/web';
import { getClosed, getOngoing } from '@services/case-service';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

export const Oversikt: React.FC = () => {
  const { representingEntity, user, cases, invoices } = useAppContext();
  const initialFocus = useRef(null);
  const [flagInvoices, setFlagInvoices] = useState(false);

  const localstorageKey = 'welcome-modal';
  const { value: isWelcomeModalOpen, set: setIsWelcomeModalOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: true,
    initializeWithValue: true,
  });

  const setInitialFocus = () => {
    setTimeout(() => {
      initialFocus.current && initialFocus.current.focus();
    });
  };

  useEffect(() => {
    setInitialFocus();
  }, []);

  const invoicesMemo = useMemo(() => invoices, [invoices]);

  useEffect(() => {
    if (invoicesMemo) {
      setFlagInvoices(
        invoices?.invoices.filter((x) => ['REMINDER', 'DEBT_COLLECTION'].includes(x.invoiceStatus.code)).length > 0
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicesMemo]);

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
  };

  return (
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Översikt`}>
        <WelcomeModal
          isOpen={isWelcomeModalOpen}
          closeModal={() => {
            handleCloseWelcomeModal();
          }}
        />
        <main className="flex-grow bg-gray-lighter pb-20 lg:px-lg">
          <div className="relative bg-[#013556] md:-mx-lg md:-mr-48 lg:-mx-lg md:px-lg">
            <Image
              className="absolute h-[100%] w-[auto] right-0 object-cover object-[76%]"
              src={HeaderImage}
              placeholder="blur"
              width={2015}
              height={586}
              alt=""
              aria-hidden="true"
              loading="eager"
              priority
            />
            <div
              style={{ backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))' }}
              className="w-1/2  absolute left-0 top-0 right-0 bottom-0 from-[#013556]"
            ></div>
            <div
              style={{ backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))' }}
              className="container from-[#013556] lg:via-[#013556] sm:to-transparent relative m-auto py-20 mb-16 text-white"
            >
              <h1 className="text-lg leading-lg md:leading-3xl md:text-3xl">
                Hej{' '}
                {user.name.split(' ')[0]
                  ? user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].toLowerCase().slice(1)
                  : ''}
                !
              </h1>
              <div className="text-lg mb-11 max-w-[80%] md:max-w-[40rem] lg:max-w-[80rem]">
                <p>
                  Det ska vara lätt att starta, utveckla och etablera företag i Sundsvall. Här ser ni de ärenden som ert
                  företag har hos Sundsvalls kommun.
                </p>
                <p>
                  Här kan ni även göra egna anteckningar och skapa påminnelser kopplat till era ärenden. Ni väljer själv
                  vilka inom företaget som ska få ta del av påminnelserna.
                </p>
              </div>

              <Image width={189} height={50} src={NB_logo} loading="eager" alt="Näringslivsbolagets logotyp" />
            </div>
          </div>
          <div className="container m-auto">
            <TabMenu />
          </div>
          <div className={`block mt-10 lg:mt-20`}>
            <MyOverviewSection
              orgInfo={representingEntity}
              user={user}
              ongoing={getOngoing(cases)}
              closed={getClosed(cases)}
              invoices={invoices}
              flagInvoices={flagInvoices}
            />
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
};

export default Oversikt;
