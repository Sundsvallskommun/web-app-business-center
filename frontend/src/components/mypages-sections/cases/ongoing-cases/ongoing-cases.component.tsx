import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { CaseResponse, CasesData } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, emptyCaseList, getOngoing } from '@services/case-service';
import { AutoTable, AutoTableHeader, Label, useThemeQueries } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { Fragment, useRef } from 'react';
import { CaseTableCard } from '../case-table-card.component';
import { getDateString } from '../utils';

export const OngoingCases: React.FC<{ header?: React.ReactNode }> = ({ header }) => {
  const { data: cases = emptyCaseList, isFetching: isFetchingCases } = useApi<CaseResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
  });
  const ongoing = getOngoing(cases);
  const { isMinDesktop } = useThemeQueries();

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
          <Label
            rounded
            inverted={item.status?.color !== 'neutral'}
            color={item.status?.color}
            className={`whitespace-nowrap `}
          >
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
      label: 'Registrerat',
      sticky: false,
      property: 'subject.meta.created',
      screenReaderOnly: false,
      isColumnSortable: true,
      renderColumn: (value) => <span className="text-left">{getDateString(value)}</span>,
    },
  ];
  const Table = () => {
    return (
      <>
        {ongoing?.cases?.length === 0 && !isFetchingCases ? (
          <p>Det finns inga pågående ärenden</p>
        ) : ongoing?.cases?.length > 0 ? (
          <></>
        ) : (
          isFetchingCases && <p>Laddar pågående ärenden</p>
        )}
        {!isFetchingCases && ongoing?.cases?.length > 0 && (
          <div>
            {isMinDesktop ? (
              <AutoTable
                className="[&_table]:table-fixed [&_table>*>tr>*:nth-child(1)]:w-[40rem] [&_table>*>tr>*:nth-child(1)]:max-w-[40rem]"
                wrappingBorder
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
