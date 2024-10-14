'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import { NoRepresent } from '@components/no-represent/no-represent';
import { useAppContext } from '@contexts/app.context';
import { RepresentingMode } from '@interfaces/app';
import { BusinessEngagement } from '@interfaces/organisation-info';
import { EntryLayout } from '@layouts/entry-layout.component';
import Main from '@layouts/main.component';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { useApi } from '@services/api-service';
import { BusinessEngagementData } from '@services/organisation-service';
import { Button, LucideIcon, Pagination, RadioButton, Spinner, Table, cx, useThemeQueries } from '@sk-web-gui/react';
import { getAdjustedPathname, getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ValjForetag() {
  const router = useRouter();
  const { representingMode } = useAppContext();
  const [error, setError] = useState('');
  const { isMinDesktop, isMinSmallDevice } = useThemeQueries();
  const searchParams = useSearchParams();

  const { data: businessEngagements, isLoading: businessEngagementsIsLoading } = useApi<
    BusinessEngagementData,
    Error,
    BusinessEngagement[]
  >({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });
  const { setRepresenting } = useRepresentingSwitch();

  const [choosen, setChoosen] = useState('');

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const onChoice = (engagement: BusinessEngagement) => {
    setError('');
    setChoosen(engagement.organizationNumber);
  };

  const onContinue = async () => {
    const res = await setRepresenting({ organizationNumber: choosen, mode: RepresentingMode.BUSINESS });
    if (!res.error) {
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname = getAdjustedPathname(path, representingMode);
      router.push(myPagesAdjustedPathname || getRepresentingModeRoute(RepresentingMode.BUSINESS));
    } else {
      setError('Misslyckades med att välja företag');
    }
  };

  useEffect(() => {
    if (businessEngagements) {
      setPages(Math.ceil(businessEngagements.length / pageSize));
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
        <EntryLayout
          title="Välj företag"
          logoClasses="hidden medium-device:block"
          className="!py-0 !medium-device:py-40 !px-0"
        >
          <div className="w-full max-w-[73.8rem]">
            <CardElevated className="py-24 lg:py-40 px-14 lg:px-80">
              <Main>
                <div>
                  <h1 className="text-h1-small lg:text-h2-lg">Vem vill du företräda?</h1>
                  <p className="pb-12">
                    Du kan företräda andra än dig själv på Mina sidor för företag. Välj det företag eller den person du
                    vill företräda och klicka sedan på Fortsätt.
                  </p>
                </div>
                <div className="break-words lg:my-56">
                  {businessEngagements?.length === 0 ? (
                    <div className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter">
                      <div className="row-header-name">Inga företag hittades</div>
                    </div>
                  ) : (
                    <Table background className={cx('mt-40', !isMinDesktop && '[&_.sk-table-thead]:sr-only')}>
                      <Table.Header className="bg-background-200">
                        {isMinDesktop ? (
                          <>
                            <Table.HeaderColumn className="sr-only">Välj</Table.HeaderColumn>
                            <Table.HeaderColumn>Namn</Table.HeaderColumn>
                            <Table.HeaderColumn>Organisationsnummer</Table.HeaderColumn>
                          </>
                        ) : (
                          <Table.HeaderColumn>Välj organisation</Table.HeaderColumn>
                        )}
                      </Table.Header>
                      <Table.Body>
                        {businessEngagements?.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => (
                          <Table.Row
                            key={`org-${e.organizationNumber}-${e.organizationName}`}
                            className={cx('[&>td]:text-base [&>td]:cursor-default', !isMinDesktop && '[&>td]:h-full')}
                            onClick={() => onChoice(e)}
                          >
                            {isMinDesktop ? (
                              <>
                                <Table.Column>
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.organizationName}, välj organisation`}
                                  />
                                </Table.Column>
                                <Table.Column>{e.organizationName}</Table.Column>
                                <Table.Column>{e.organizationNumber}</Table.Column>
                              </>
                            ) : (
                              <Table.Column>
                                <div className="flex gap-16 py-8">
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.organizationName}, välj organisation`}
                                  />
                                  <div className="grow flex flex-col gap-8">
                                    <div className="flex flex-col gap-y-4">
                                      <div>Namn</div>
                                      <div className="font-bold">{e.organizationName}</div>
                                    </div>
                                    <div className="flex flex-col gap-y-4">
                                      <div>Organisationsnummer</div>
                                      <div className="font-bold">{e.organizationNumber}</div>
                                    </div>
                                  </div>
                                </div>
                              </Table.Column>
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                      <Table.Footer>
                        <Pagination
                          className="w-full flex justify-center"
                          pagesBefore={isMinSmallDevice ? 1 : 0}
                          pagesAfter={isMinSmallDevice ? 1 : 0}
                          pages={pages}
                          activePage={currentPage}
                          changePage={(page) => setCurrentPage(page)}
                        />
                      </Table.Footer>
                    </Table>
                  )}
                  <p className="pt-12 pb-12">
                    *Genom att klicka på Fortsätt godkänner du att Sundsvalls kommun hämtar uppgifter om ditt företag
                    från Bolagsverket.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    data-cy="representingEntityButton"
                    loading={businessEngagementsIsLoading}
                    loadingText={'Hämtar bolagsengagemang'}
                    color="vattjom"
                    disabled={!choosen}
                    onClick={() => onContinue()}
                    rightIcon={<Icon icon={<ArrowRight />} />}
                  >
                    Fortsätt
                  </Button>
                </div>
                {error && <p className="pt-4 pb-4 text-red-500">{error}</p>}
              </Main>
            </CardElevated>
          </div>
        </EntryLayout>
      )}
    </>
  );
}
