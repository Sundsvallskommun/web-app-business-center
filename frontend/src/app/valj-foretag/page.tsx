'use client';

import { NoRepresent } from '@components/no-represent/no-represent';
import { useAppContext } from '@contexts/app.context';
import { BusinessEngagementData } from '@services/organisation-service';
import { Button, Icon, RadioButton, Spinner, Table } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { CardElevated } from '../../components/cards/card-elevated.component';
import { BusinessEngagement } from '../../interfaces/organisation-info';
import { EntryLayout } from '../../layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { useRepresentingSwitch } from '../../layouts/site-menu/site-menu-items';
import { useApi } from '../../services/api-service';

export default function ValjForetag() {
  const router = useRouter();
  const { representingMode } = useAppContext();
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
  const { setRepresenting } = useRepresentingSwitch();

  const [choosen, setChoosen] = useState('');

  const pageSize = 5;

  // const [managedRows, setManagedRows] = useState<BusinessEngagement[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const onChoice = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setChoosen(event.target?.value ?? '');
  };

  const onContinue = async () => {
    const res = await setRepresenting({ organizationNumber: choosen });
    if (!res.error) {
      router.push(getRepresentingModeRoute(representingMode));
    } else {
      setError('Misslyckades med att välja företag');
    }
  };

  useEffect(() => {
    if (businessEngagements) {
      setPages(Math.ceil(businessEngagements.length / pageSize));
      // const startIndex = currentPage * pageSize - pageSize;
      // setManagedRows(businessEngagements.slice(startIndex, startIndex + pageSize));
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
        <EntryLayout title="Välj företag">
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
                    <Table background>
                      <Table.Header className="bg-background-200">
                        <Table.HeaderColumn>Namn</Table.HeaderColumn>
                        <Table.HeaderColumn>Organisationsnummer</Table.HeaderColumn>
                      </Table.Header>
                      <Table.Body>
                        {businessEngagements?.map((e, idx) => (
                          <Table.Row key={`org-${e.organizationNumber}-${e.organizationName}`}>
                            <Table.Column>
                              <RadioButton onChange={onChoice} value={e.organizationNumber} name="entity">
                                {e.organizationName}
                              </RadioButton>
                            </Table.Column>
                            <Table.Column>{e.organizationNumber}</Table.Column>
                          </Table.Row>
                        ))}
                      </Table.Body>
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
                    rightIcon={<Icon name="arrow-right" />}
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
