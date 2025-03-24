import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useAppContext } from '@contexts/app.context';
import { CaseResponse, CasesData } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, emptyCaseList, getOngoing } from '@services/case-service';
import { AutoTable, AutoTableHeader, Button, Icon, Label, useThemeQueries } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';
import { Fragment, useRef } from 'react';
import { CaseTableCard } from '../case-table-card.component';

export const OngoingCases: React.FC<{ header?: React.ReactNode }> = ({ header }) => {
  const { data: cases = emptyCaseList, isFetching: isFetchingCases } = useApi<CaseResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
  });
  const ongoing = getOngoing(cases);
  const { isMinDesktop } = useThemeQueries();
  const { representingMode } = useAppContext();
  const ref = useRef<null | HTMLDivElement>(null);

  const headers: Array<AutoTableHeader | string> = [
    {
      label: 'Namn',
      sticky: true,
      property: 'subject.caseType',
      screenReaderOnly: false,
      renderColumn: (value) => (
        <div className="text-left">
          <Fragment>
            <div>
              <strong className="block">{value}</strong>
            </div>
          </Fragment>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Status',
      sticky: false,
      property: 'status.label',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Label rounded inverted={item.status?.color !== 'neutral'} color={item.status?.color}>
            {value}
          </Label>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Ärendenummer',
      sticky: false,
      property: 'caseId',
      screenReaderOnly: false,
      isColumnSortable: true,
      renderColumn: (value) => (
        <div className="text-left">
          <div className="break-all hyphens-auto max-w-[25ch]">{value}</div>
        </div>
      ),
    },
    {
      label: 'Visa ärende',
      sticky: false,
      property: 'externalCaseId',
      screenReaderOnly: true,
      isColumnSortable: false,
      renderColumn: (value) => (
        <div className="w-full text-right">
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${value}`}>
            <Button size="sm" showBackground variant="tertiary" as="span" rightIcon={<Icon icon={<ArrowRight />} />}>
              Visa
            </Button>
          </NextLink>
        </div>
      ),
    },
  ];

  const Table = () => {
    return (
      <>
        {ongoing?.cases?.length === 0 && !isFetchingCases ? (
          <p>Det finns inga pågående ärenden</p>
        ) : (
          isFetchingCases && <p>Laddar pågående ärenden</p>
        )}
        {!isFetchingCases && ongoing?.cases?.length > 0 && (
          <div>
            {isMinDesktop ? (
              <AutoTable
                className="[&_table]:table-fixed [&_table>*>tr>*:nth-child(1)]:w-[40rem] [&_table>*>tr>*:nth-child(1)]:max-w-[40rem]"
                wrappingBorder
                tableSortable={false}
                pageSize={9999}
                footer={false}
                background={false}
                autodata={ongoing?.cases}
                autoheaders={headers}
              />
            ) : (
              <CardList data={ongoing?.cases} Card={CaseTableCard} />
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={ref}>
      <TableWrapper header={header}>
        <Table />
      </TableWrapper>
    </div>
  );
};
