import { BusinessEngagementData, getBusinessEngagements, setRepresenting } from '../services/organisation-service';
import { Button, Pagination, Spinner } from '@sk-web-gui/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import EmptyLayout from '../components/empty-layout/empty-layout.component';
import { NoRepresent } from '@components/no-represent/no-represent';
import { getMe } from '@services/user-service';
import { useAppContext } from '../contexts/app.context';
import { useRouter } from 'next/router';

// TODO: implement a11y for radio buttons in real component

export default function Start() {
  const router = useRouter();
  const { setRepresentingEntity, setUser } = useAppContext();

  const [choosen, setChoosen] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [businessEngagements, setBusinessEngagements] = useState<BusinessEngagementData>({ engagements: [] });

  const [error, setError] = useState('');

  const pageSize = 5;

  const [managedRows, setManagedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const initalFocus = useRef(null);
  const setInitalFocus = () => {
    setTimeout(() => {
      initalFocus.current && initalFocus.current.focus();
    });
  };

  const onChoice = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setChoosen(event.target?.value ?? '');
  };

  const onContinue = () => {
    setIsLoading(true);
    setError('');
    setRepresenting(choosen)
      .then((representing) => {
        if (!representing.orgName || !representing.orgNumber) {
          setIsLoading(false);
          setError('Misslyckades med att välja företag');
          return;
        }
        setRepresentingEntity(representing);
        router.push('/oversikt');
      })
      .catch(() => {
        setIsLoading(false);
        setError('Misslyckades med att välja företag');
      });
  };

  useEffect(() => {
    // NOTE: If we set focus on the next button
    //       the browser will automatically scroll
    //       down to the button.
    setInitalFocus();
    setIsLoading(true);
    getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => router.push('/login'));
    getBusinessEngagements().then((es) => {
      setBusinessEngagements(es);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPages(Math.ceil(businessEngagements?.engagements.length / pageSize));
    const startIndex = currentPage * pageSize - pageSize;
    setManagedRows(businessEngagements?.engagements.slice(startIndex, startIndex + pageSize));
  }, [currentPage, businessEngagements?.engagements, pageSize]);

  // Logged in user have no businessengagements
  if (!isLoading && Array.isArray(managedRows) && managedRows.length == 0) {
    return (
      <main>
        <NoRepresent />
      </main>
    );
  }
  return (
    <>
      {isLoading ? (
        <main>
          <div className="w-screen h-screen flex place-items-center place-content-center">
            <Spinner size="lg" aria-label="Hämtar företag" />
          </div>
        </main>
      ) : (
        <EmptyLayout title="Företagscenter Mina Sidor - Välj Företag">
          <main>
            <div className="flex items-center justify-center min-h-screen">
              <div className="max-w-5xl w-full flex flex-col bg-white p-6 md:p-20 shadow-lg text-left">
                <div className="">
                  <h1 className="mb-10 text-xl">Vem vill du företräda?</h1>
                  <p className="pb-12">
                    Du kan företräda andra än dig själv på Mina sidor för företag. Välj det företag eller den person du
                    vill företräda och klicka sedan på Fortsätt.
                  </p>
                </div>
                <h6 className="mt-0 mb-6">Företag</h6>
                <div className="break-words">
                  <div
                    className="row-header p-4 gap-2 grid grid-cols-2 font-bold"
                    style={{ backgroundColor: '#D9E6EF' }}
                  >
                    <div className="row-header-name">Namn</div>
                    <div className="row-header-social-security-number">Organisationsnummer</div>
                  </div>
                  {businessEngagements?.error ? (
                    <div className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter">
                      <div className="row-header-name">Det gick inte att hämta företag</div>
                    </div>
                  ) : (
                    managedRows.map((e, idx) => (
                      <div
                        key={`org-${e.organizationNumber}-${e.organizationName}`}
                        className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter"
                      >
                        <div className="row-header-name">
                          <input
                            type="radio"
                            ref={idx === 0 ? initalFocus : null}
                            onChange={onChoice}
                            value={e.organizationNumber}
                            name="entity"
                            className="p-3 mr-1"
                            id={`org-${e.organizationNumber}`}
                            // defaultChecked={idx === 0}
                          />{' '}
                          <label htmlFor={`org-${e.organizationNumber}`}>{e.organizationName}</label>
                        </div>
                        <div className="row-header-social-security-number">{e.organizationNumber}</div>
                      </div>
                    ))
                  )}
                </div>
                {pages > 1 && (
                  <Pagination
                    pages={pages}
                    activePage={currentPage}
                    changePage={(page: number) => setCurrentPage(page)}
                  />
                )}
                <p className="pt-12 pb-12">
                  *Genom att klicka på Fortsätt godkänner du att Sundsvalls kommun hämtar uppgifter om ditt företag från
                  Bolagsverket.
                </p>
                <Button
                  variant="solid"
                  data-cy="representingEntityButton"
                  loading={isLoading}
                  loadingText={'Hämtar bolagsengagemang'}
                  color="primary"
                  className="rounded-md"
                  disabled={!choosen}
                  onClick={() => onContinue()}
                >
                  Fortsätt
                </Button>
                {error && <p className="pt-4 pb-4 text-red-500">{error}</p>}
              </div>
            </div>
          </main>
        </EmptyLayout>
      )}
    </>
  );
}
