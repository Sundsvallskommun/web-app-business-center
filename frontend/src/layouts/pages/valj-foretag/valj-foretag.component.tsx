'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import { useAppContext } from '@contexts/app.context';
import { RepresentingMode } from '@interfaces/app';
import { BusinessEngagement } from '@interfaces/organisation-info';
import { EntryLayout } from '@layouts/entry-layout.component';
import Main from '@layouts/main.component';
import { NoRepresent } from '@layouts/pages/valj-foretag/no-represent';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { useCombinedBusinessEngagements } from '@services/organisation-service';
import { Button, Icon, Pagination, RadioButton, Spinner, Table, cx, useThemeQueries } from '@sk-web-gui/react';
import { getAdjustedPathname, getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ArrowRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ValjForetag() {
  const router = useRouter();
  const { representingMode } = useAppContext();
  const { t } = useTranslation(['valj-foretag', 'common']);
  const [error, setError] = useState('');
  const { isMinDesktop, isMinSmallDevice } = useThemeQueries();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { engagements, engagementsIsLoading } = useCombinedBusinessEngagements();
  const { setRepresenting } = useRepresentingSwitch();

  const [choosen, setChoosen] = useState('');

  const pageSize = 10;
  const hasEngagements = (engagements?.length ?? 0) > 0;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const onChoice = (engagement: BusinessEngagement) => {
    setError('');
    setChoosen(engagement.organizationNumber ?? '');
  };

  const onContinue = async () => {
    const res = await setRepresenting({ organizationNumber: choosen, mode: RepresentingMode.BUSINESS });
    if (!res.error) {
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname = getAdjustedPathname(path, representingMode);
      router.push(
        pathname !== path && myPagesAdjustedPathname
          ? myPagesAdjustedPathname
          : getRepresentingModeRoute(RepresentingMode.BUSINESS)
      );
    } else {
      setError(t('valj-foretag:selectFailed'));
    }
  };

  useEffect(() => {
    if (engagements) {
      setPages(Math.ceil(engagements.length / pageSize));
    }
  }, [currentPage, engagements, pageSize]);

  // Logged in user have no engagements
  if (!engagementsIsLoading && engagements?.length == 0) {
    return (
      <main>
        <NoRepresent />
      </main>
    );
  }
  return (
    <>
      {engagementsIsLoading ? (
        <main>
          <div className="w-screen h-screen flex place-items-center place-content-center">
            <Spinner aria-label={t('valj-foretag:loading')} />
          </div>
        </main>
      ) : (
        <EntryLayout
          title={t('valj-foretag:title')}
          logoClasses="hidden medium-device:block"
          className="!py-0 !medium-device:py-40 !px-0"
        >
          <div className="w-full max-w-[80rem]">
            <CardElevated className="py-24 lg:py-40 px-14 lg:px-80">
              <Main>
                <div>
                  <h1 className="text-h1-small lg:text-h2-lg">{t('valj-foretag:subtitle')}</h1>
                </div>
                <div className="break-words lg:my-56">
                  {!hasEngagements ? (
                    <div className="rounded max-w-prose">
                      {t('valj-foretag:noEngagements')}
                    </div>
                  ) : (
                    <Table background className={cx('mt-40', !isMinDesktop && '[&_.sk-table-thead]:sr-only')}>
                      <Table.Header>
                        {isMinDesktop ? (
                          <>
                            <Table.HeaderColumn className="sr-only">{t('valj-foretag:select')}</Table.HeaderColumn>
                            <Table.HeaderColumn>{t('valj-foretag:name')}</Table.HeaderColumn>
                            <Table.HeaderColumn>{t('valj-foretag:organizationNumber')}</Table.HeaderColumn>
                          </>
                        ) : (
                          <Table.HeaderColumn>{t('valj-foretag:selectOrganization')}</Table.HeaderColumn>
                        )}
                      </Table.Header>
                      <Table.Body>
                        {engagements?.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => (
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
                                    aria-label={`${e.organizationName}, ${t('valj-foretag:selectOrganization')}`}
                                  />
                                </Table.Column>
                                <Table.Column>
                                  <span className="font-bold">{e.organizationName}</span>
                                  {e.isRepresentative ? <span className="ml-[.5em]">{t('common:isRepresentative')}</span> : null}
                                </Table.Column>
                                <Table.Column>{e.organizationNumber}</Table.Column>
                              </>
                            ) : (
                              <Table.Column>
                                <div className="flex gap-16 py-8">
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.organizationName}, ${t('valj-foretag:selectOrganization')}`}
                                  />
                                  <div className="grow flex flex-col gap-8">
                                    <div className="flex flex-col gap-y-4">
                                      <div className="font-bold">
                                        <span className="font-bold">{e.organizationName}</span>
                                        {e.isRepresentative ? <span className="ml-[.5em]">{t('common:isRepresentative')}</span> : null}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-y-4">
                                      <div>{`${t('valj-foretag:orgNr')} ${e.organizationNumber}`}</div>
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
                    {t('valj-foretag:disclaimer')}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    data-cy="representingEntityButton"
                    loading={engagementsIsLoading}
                    loadingText={t('valj-foretag:loadingEngagements')}
                    color="vattjom"
                    disabled={!choosen}
                    onClick={() => onContinue()}
                    rightIcon={<Icon icon={<ArrowRight />} />}
                  >
                    {t('valj-foretag:continue')}
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
