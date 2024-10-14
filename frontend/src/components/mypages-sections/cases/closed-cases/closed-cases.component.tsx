import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useAppContext } from '@contexts/app.context';
import { CaseResponse, CasesData } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, emptyCaseList, getClosed } from '@services/case-service';
import { AutoTable, AutoTableHeader, Button, Label, LucideIcon, useThemeQueries } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import NextLink from 'next/link';
import { Fragment, useRef } from 'react';
import { CaseTableCard } from '../case-table-card.component';

export const ClosedCases: React.FC<{ header?: React.ReactNode }> = ({ header }) => {
  const { data: cases = emptyCaseList, isFetching: isFetchingCases } = useApi<CaseResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
  });
  const closed = getClosed(cases);
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();
  const { representingMode } = useAppContext();

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
      label: 'Visa ärende',
      sticky: false,
      property: 'externalCaseId',
      screenReaderOnly: true,
      isColumnSortable: false,
      renderColumn: (value) => (
        <div className="w-full text-right">
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${value}`}>
            <Button size="sm" showBackground variant="tertiary" as="span" rightIcon={<LucideIcon name="arrow-right" />}>
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
        {closed?.cases?.length === 0 && !isFetchingCases ? (
          <p>Det finns inga avslutade ärenden</p>
        ) : closed?.cases?.length > 0 ? (
          <></>
        ) : (
          isFetchingCases && <p>Laddar avslutade ärenden</p>
        )}
        {!isFetchingCases && closed?.cases?.length > 0 && (
          <div>
            {isMinDesktop ? (
              <AutoTable
                className="[&_table]:table-fixed [&_table>*>tr>*:nth-child(1)]:w-[40rem] [&_table>*>tr>*:nth-child(1)]:max-w-[40rem]"
                wrappingBorder
                pageSize={9999}
                footer={false}
                background={false}
                autodata={closed?.cases}
                autoheaders={headers}
              />
            ) : (
              <CardList data={closed?.cases} Card={CaseTableCard} />
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
