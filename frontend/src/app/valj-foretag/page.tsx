'use client';

import { BusinessEngagementData } from '@services/organisation-service';
import { Button, Pagination, Spinner } from '@sk-web-gui/react';
import { ChangeEvent, useEffect, useState } from 'react';

import EmptyLayout from '@layouts/empty-layout.component';
import { NoRepresent } from '@components/no-represent/no-represent';
import { useAppContext } from '@contexts/app.context';
import { getMyPagesModeRoute } from '@utils/pagesModeRoute';
import { useRouter } from 'next/navigation';
import { BusinessEngagement, OrganisationInfo } from '../../interfaces/organisation-info';
import { useApi } from '../../services/api-service';

export default function ValjForetag() {
  const router = useRouter();
  const { myPagesMode } = useAppContext();
  const [error, setError] = useState('');

  const { data: businessEngagements, isLoading: businessEngagementsIsLoading } = useApi<
    BusinessEngagementData,
    Error,
    BusinessEngagement[]
  >({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });
  const representingMutation = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'post',
  });

  const [choosen, setChoosen] = useState('');

  const pageSize = 5;

  const [managedRows, setManagedRows] = useState<BusinessEngagement[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const onChoice = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setChoosen(event.target?.value ?? '');
  };

  const onContinue = async () => {
    const res = await representingMutation.mutateAsync({ organizationNumber: choosen });
    if (!res.error) {
      router.push(`${getMyPagesModeRoute(myPagesMode)}`);
    } else {
      setError('Misslyckades med att välja företag');
    }
  };

  useEffect(() => {
    if (businessEngagements) {
      setPages(Math.ceil(businessEngagements.length / pageSize));
      const startIndex = currentPage * pageSize - pageSize;
      setManagedRows(businessEngagements.slice(startIndex, startIndex + pageSize));
    }
  }, [currentPage, businessEngagements, pageSize]);

  // Logged in user have no businessengagements
  if (!businessEngagementsIsLoading && businessEngagements?.length == 0) {
    return (
      <main>
        <NoRepresent />
      </main>
    );
  }
  return (
    <>
      {businessEngagementsIsLoading ? (
        <main>
          <div className="w-screen h-screen flex place-items-center place-content-center">
            <Spinner aria-label="Hämtar företag" />
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
                  {businessEngagements?.length === 0 ? (
                    <div className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter">
                      <div className="row-header-name">Inga företag hittades</div>
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
                  data-cy="representingEntityButton"
                  loading={businessEngagementsIsLoading}
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
