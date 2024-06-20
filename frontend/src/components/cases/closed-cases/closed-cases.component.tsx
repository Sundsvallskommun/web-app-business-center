import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useLocalStorageValue } from '@react-hookz/web';
import { casesHandler, emptyCaseList, getCasePdf, getClosed } from '@services/case-service';
import { AutoTable, AutoTableHeader, Button, Label, useSnackbar } from '@sk-web-gui/react';
import _ from 'lodash';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../contexts/app.context';
import { CaseResponse, CasesData } from '../../../interfaces/case';
import { useApi } from '../../../services/api-service';
import { useWindowSize } from '../../../utils/use-window-size.hook';
import { CaseTableCard } from '../case-table-card.component';
import { CardList } from '../../cards/cards.component';
import { TableWrapper } from '../../table-wrapper/table-wrapper.component';
import dayjs from 'dayjs';

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
  const windowSize = useWindowSize();

  const localstorageKey = 'closed-cases-component';
  const { value: disclosureIsOpen, set: setDisclosureIsOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: false,
    initializeWithValue: true,
  });
  const { highlightedTableRow, setHighlightedTableRow } = useAppContext();
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number>();
  const [timeoutRef, setTimeoutRef] = useState<string | number | NodeJS.Timeout>();

  useEffect(() => {
    if (!_.isEmpty(highlightedTableRow)) {
      const itemIndex = closed?.cases?.findIndex(
        (item) => item[highlightedTableRow.property] === highlightedTableRow.value
      );
      if (itemIndex !== -1) {
        setHighlightedItemIndex(itemIndex);
        ref?.current?.scrollIntoView({ behavior: 'smooth' });
        if (!disclosureIsOpen) {
          setDisclosureIsOpen(true);
        }
        if (timeoutRef) clearTimeout(timeoutRef);
        setTimeoutRef(
          setTimeout(() => {
            setHighlightedTableRow({});
            setHighlightedItemIndex(undefined);
          }, 20000)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedTableRow, closed?.cases]);

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
        <div className="text-left lg:w-[35rem]">
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
        <div className="text-left lg:w-[18.9rem]">
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
        <div className="text-left lg:w-[18.9rem]">
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
      renderColumn: (value) => <span>{dayjs(value).format('YYYY-MM-DD')}</span>,
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
            {windowSize.lg ? (
              <AutoTable
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
