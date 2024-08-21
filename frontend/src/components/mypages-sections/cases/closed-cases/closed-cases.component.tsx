import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { CaseResponse, CasesData } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, emptyCaseList, getCasePdf, getClosed } from '@services/case-service';
import { AutoTable, AutoTableHeader, Label, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { Fragment, useRef, useState } from 'react';
import { CaseTableCard } from '../case-table-card.component';
import { getDateString } from '../utils';

export const ClosedCases: React.FC<{ header?: React.ReactNode }> = ({ header }) => {
  const { data: cases = emptyCaseList, isFetching: isFetchingCases } = useApi<CaseResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
  });
  const closed = getClosed(cases);

  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>();
  const message = useSnackbar();
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();

  const getPdf = (caseId: string) => {
    setIsLoading((old) => {
      const newObj = { ...old };
      newObj[caseId] = true;
      return newObj;
    });
    getCasePdf(caseId)
      .then((d) => {
        if (typeof d.error === 'undefined') {
          const uri = `data:application/pdf;base64,${d.pdf.base64}`;
          const link = document.createElement('a');
          link.href = uri;
          link.setAttribute('download', `${caseId}.pdf`);
          document.body.appendChild(link);
          link.click();
        } else {
          message({
            message: 'Det gick inte att hämta filen.',
            status: 'error',
          });
        }
      })
      .finally(() => {
        setIsLoading((old) => {
          const newObj = { ...old };
          newObj[caseId] = false;
          return newObj;
        });
      });
  };

  const headers: Array<AutoTableHeader | string> = [
    {
      label: 'Namn',
      sticky: true,
      property: 'subject.caseType',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
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
    // {
    //   label: 'Ärendeknapp',
    //   sticky: false,
    //   screenReaderOnly: true,
    //   renderColumn: (value, item) => (
    //     <div className="text-right w-full">
    //       <Button
    //         aria-label={`Hämta PDF för ärende ${item.caseId}`}
    //         color="primary"
    //         loading={isLoading?.[item.externalCaseId]}
    //         loadingText="Hämtar"
    //         className="w-full lg:w-auto px-md"
    //         onClick={() => getPdf(item.externalCaseId)}
    //       >
    //         Hämta PDF <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
    //       </Button>
    //     </div>
    //   ),
    //   isColumnSortable: false,
    // },
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
