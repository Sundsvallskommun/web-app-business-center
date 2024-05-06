import { Button, Badge, OptionValueType, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { CasesData, ICase } from '../../interfaces/case';
import { statusCodes } from '../../interfaces/status-codes';
import { ReminderFormModel } from '../../services/reminder-service';
import ActionModal from '../action-modal/action-modal.component';
import { CasesComponent } from '../cases-component/cases-component';
import { ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/table';
import { useAppContext } from '../../contexts/app.context';
import { getCasePdf } from '@services/case-service';
import { useMessage } from '@sk-web-gui/message';
import { useLocalStorageValue } from '@react-hookz/web';
import _ from 'lodash';
import { statusColorMap, statusColorMapOrder } from '@utils/status-color';
import { HelpTooltip } from '@components/tooltip/help-tooltip.component';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

export const ClosedCases: React.FC<{ closed: CasesData }> = (props) => {
  const { isLoadingCases } = useAppContext();
  const [selectedCase, setSelectedCase] = useState<ReminderFormModel>();
  const [isOpen, setIsOpen] = useState(false);
  const [filter] = useState(statusCodes.Approved);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>(null);
  const message = useMessage();
  const ref = useRef<null | HTMLDivElement>(null);
  const [labels, setLabels] = useState(props.closed.labels);
  const [casesList, setCases] = useState<ICase[]>([]);
  const [selectedSortAction, setSelectedSortAction] = useState('');

  const [pageSize] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const defaultSort = { idx: 1, sortMode: false };

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
      const itemIndex = casesList.findIndex((item) => item[highlightedTableRow.property] === highlightedTableRow.value);
      if (itemIndex !== -1) {
        setHighlightedItemIndex(itemIndex);
        ref.current.scrollIntoView({ behavior: 'smooth' });
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
  }, [highlightedTableRow, casesList]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = (_case: ICase) => {
    const reminderData: ReminderFormModel = {
      heading: '',
      note: '',
      caseId: _case.caseId,
      caseLink: '?',
      reminderDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      caseType: _case.subject.caseType,
      externalCaseId: _case.externalCaseId,
    };
    setSelectedCase(reminderData);
    setIsOpen(true);
  };

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

  const sortHandler = useCallback((sortColumn: number, sortAscending: boolean) => {
    const asc = sortAscending ? 1 : -1;
    setCases((cases) => [
      ...cases.sort((caseA: ICase, caseB: ICase) => {
        switch (sortColumn) {
          case 0:
            return caseA.subject.caseType.toLowerCase() > caseB.subject.caseType.toLowerCase()
              ? asc
              : caseA.subject.caseType.toLowerCase() < caseB.subject.caseType.toLowerCase()
              ? -1 * asc
              : 0;
          case 1:
            return caseA.subject.meta.modified > caseB.subject.meta.modified
              ? asc
              : caseA.subject.meta.modified < caseB.subject.meta.modified
              ? -1 * asc
              : 0;
          case 2:
            if (statusColorMapOrder(caseA.status.color) == statusColorMapOrder(caseB.status.color)) {
              return caseA.status.label > caseB.status.label
                ? asc
                : caseA.status.label < caseB.status.label
                ? -1 * asc
                : 0;
            }
            return statusColorMapOrder(caseA.status.color) > statusColorMapOrder(caseB.status.color)
              ? asc
              : statusColorMapOrder(caseA.status.color) < statusColorMapOrder(caseB.status.color)
              ? -1 * asc
              : 0;
          default:
            return asc;
        }
      }),
    ]);
  }, []);
  const headers: ZebraTableHeader[] = labels.map((l, idx) => ({
    element: (
      <span key={`mh${idx}`} className="font-bold">
        {l.label}
      </span>
    ),
    isShown: l.shownForStatus === filter || l.shownForStatus === statusCodes.Any,
    isColumnSortable: l.sortable,
    screenReaderOnly: l.screenReaderOnly,
  }));
  const rows: ZebraTableColumn[][] = casesList.map((r: ICase, idx) => [
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <div>
            <strong className="block lg:w-[30rem] xl:w-[44rem]">{r.subject.caseType}</strong>
          </div>
          <div>
            <small>
              <span className="pr-md">{r.caseId}</span>
            </small>
          </div>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Senast ändrat: </span>
          <span className="block xl:w-[14rem]">{r.subject.meta.modified}</span>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Status: </span>
          <span className="flex items-center xl:w-[20rem]">
            <Badge
              size="sm"
              variant="solid"
              className={`w-[14px] max-h-[14px] h-[14px] bg-${statusColorMap(r.status.color)} mr-2`}
            />
            {r.status.label}
          </span>
        </Fragment>
      ),
      isShown: r.status.code === statusCodes.Rejected || r.status.code === statusCodes.Approved,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Giltig från: </span>
          <span>{r.validFrom}</span>
        </Fragment>
      ),
      isShown: false,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Giltig till och med: </span>
          <span>{r.validTo}</span>
        </Fragment>
      ),
      isShown: false,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Skapa egen påminnelse: </span>
          <span>
            <div className="mt-4 lg:mt-0 relative">
              <Button
                aria-label={`Skapa egen påminnelse`}
                key={`mr${idx}`}
                variant="solid"
                color=""
                className="w-full xl:w-auto px-md"
                onClick={() => openModal(r)}
                leftIcon={
                  <svg
                    className="MuiSvgIcon-root material-icon mr-sm"
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    data-testid="EditCalendarOutlinedIcon"
                  >
                    <path d="M2 8H16V10H18V4C18 2.9 17.1 2 16 2H15V0H13V2H5V0H3V2H2C0.89 2 0.00999999 2.9 0.00999999 4L0 18C0 19.1 0.89 20 2 20H9V18H2V8ZM2 4H16V6H2V4ZM19.84 14.28L19.13 14.99L17.01 12.87L17.72 12.16C18.11 11.77 18.74 11.77 19.13 12.16L19.84 12.87C20.23 13.26 20.23 13.89 19.84 14.28ZM16.3 13.58L18.42 15.7L13.12 21H11V18.88L16.3 13.58Z" />
                  </svg>
                }
              >
                Skapa egen påminnelse
              </Button>
            </div>
          </span>
        </Fragment>
      ),
      isShown: r.status.code === statusCodes.Rejected || r.status.code === statusCodes.Approved,
    },
    {
      element: (
        <Button
          aria-label={`Hämta PDF för ärende ${r.caseId}`}
          key={`mr${idx}`}
          variant="solid"
          color="primary"
          loading={isLoading?.[r.externalCaseId]}
          loadingText="Hämtar"
          className="w-full xl:w-auto px-md"
          onClick={() => getPdf(r.externalCaseId)}
        >
          Hämta PDF <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
        </Button>
      ),
      isShown: true,
    },
  ]);
  const table = (
    <>
      {props.closed.cases.length !== 0 && !isLoadingCases && (
        <div className="mx-md md:mx-lg mb-md md:mb-lg lg:hidden">
          <fieldset>
            <legend className="text-sm font-bold">Sortera efter</legend>
            <Select
              aria-label="Sortera efter"
              id="sort"
              className="mt-2"
              size="md"
              value={{ label: selectedSortAction, data: selectedSortAction }}
              onChange={(value: OptionValueType) => {
                const index = labels.findIndex((a) => a.label.toString() === value.label);
                setSelectedSortAction(() => {
                  sortHandler(index, true);
                  return labels[index].label;
                });
              }}
            >
              {labels.map((item, index) => (
                <Select.Option disabled={index === 2} key={item.label} value={{ label: item.label, data: item }} />
              ))}
            </Select>
          </fieldset>
        </div>
      )}
      {props.closed.cases.length === 0 && !isLoadingCases ? (
        <p className="px-lg w-3/5">Det finns inga avslutade ärenden</p>
      ) : rows?.length > 0 ? (
        <></>
      ) : isLoadingCases ? (
        <p className="px-lg w-3/5">Laddar avslutade ärenden</p>
      ) : (
        <p className="px-lg w-3/5">Det gick inte att hämta avslutade ärenden</p>
      )}
      <ZebraTable
        highlightedItemIndex={highlightedItemIndex}
        changePage={(page) => setPage(page)}
        page={page}
        pages={Math.ceil(rows.length / pageSize)}
        pageSize={pageSize}
        headers={headers}
        rows={rows}
        defaultSort={defaultSort}
        tableSortable={true}
        sortHandler={sortHandler}
        BottomComponent={
          <HelpTooltip
            ariaLabel={'Hjälptext'}
          >{`Här hittar du ärenden som har fått beslut och är avslutade.`}</HelpTooltip>
        }
      />
    </>
  );

  useEffect(() => {
    setLabels(props.closed.labels);
    if (0 in props.closed.labels) {
      setSelectedSortAction(props.closed.labels[0].label);
    }
    setCases((JSON.parse(JSON.stringify(props.closed.cases)) as ICase[]) || []);
    sortHandler(defaultSort.idx, defaultSort.sortMode);
  }, [props.closed, sortHandler, defaultSort.idx, defaultSort.sortMode]);

  return (
    <div ref={ref}>
      <CasesComponent
        header={
          <>
            {isLoadingCases ? (
              <span>Laddar avslutade ärenden</span>
            ) : (
              <span>Avslutade ärenden ({props.closed?.cases?.length})</span>
            )}
          </>
        }
        helpText={`Här hittar du ärenden som har fått beslut och är avslutade.`}
        disclosureIsOpen={disclosureIsOpen}
        setDisclosureIsOpenCallback={(open) => setDisclosureIsOpen(open)}
      >
        {table}
      </CasesComponent>
      <ActionModal isOpen={isOpen} closeModal={closeModal} reminder={selectedCase} />
    </div>
  );
};
