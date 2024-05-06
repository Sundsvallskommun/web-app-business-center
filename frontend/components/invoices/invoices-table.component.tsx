import { Button, Badge, OptionValueType, Select } from '@sk-web-gui/react';
import { ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/table';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '@contexts/app.context';
import { useMessage } from '@sk-web-gui/message';
import _ from 'lodash';
import { useLocalStorageValue } from '@react-hookz/web';
import { statusColorMap, statusColorMapOrder } from '@utils/status-color';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { IInvoice, InvoicesData } from '@interfaces/invoice';
import { CasesComponent } from '@components/cases-component/cases-component';
import { getInvoicePdf } from '@services/invoice-service';

export const InvoicesTable: React.FC<{ data: InvoicesData; heading: string; helpText: string }> = (props) => {
  const [labels, setLabels] = useState(props.data.labels);
  const [selectedSortAction, setSelectedSortAction] = useState('');
  const [invoicesList, setInvoicesList] = useState<IInvoice[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>(null);
  const message = useMessage();
  const ref = useRef<null | HTMLDivElement>(null);

  const [pageSize] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const defaultSort = { idx: 2, sortMode: false };

  const localstorageKey = `invoices-${props.heading.toLowerCase()}-component`;
  const { value: disclosureIsOpen, set: setDisclosureIsOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: true,
    initializeWithValue: true,
  });
  const { highlightedTableRow, setHighlightedTableRow, isLoadingInvoices } = useAppContext();
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number>();
  const [timeoutRef, setTimeoutRef] = useState<string | number | NodeJS.Timeout>();

  useEffect(() => {
    if (!_.isEmpty(highlightedTableRow)) {
      const itemIndex = invoicesList.findIndex(
        (item) => item[highlightedTableRow.property] === highlightedTableRow.value
      );
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
  }, [highlightedTableRow, invoicesList]);

  const getPdf = (invoiceNumber: string) => {
    setIsLoading((old) => {
      const newObj = { ...old };
      newObj[invoiceNumber] = true;
      return newObj;
    });
    getInvoicePdf(invoiceNumber)
      .then((d) => {
        if (typeof d.error === 'undefined') {
          const uri = `data:application/pdf;base64,${d.pdf.file}`;
          const link = document.createElement('a');
          link.href = uri;
          link.setAttribute('download', `${invoiceNumber}.pdf`);
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
          newObj[invoiceNumber] = false;
          return newObj;
        });
      });
  };

  const sortHandler = useCallback((sortColumn: number, sortAscending: boolean) => {
    const asc = sortAscending ? 1 : -1;
    setInvoicesList((invoices) => [
      ...invoices.sort((invoiceA: IInvoice, invoiceB: IInvoice) => {
        switch (sortColumn) {
          case 0:
            return invoiceA.dueDate > invoiceB.dueDate ? asc : invoiceA.dueDate < invoiceB.dueDate ? -1 * asc : 0;
          case 1:
            return invoiceA.invoiceDescription > invoiceB.invoiceDescription
              ? asc
              : invoiceA.invoiceDescription < invoiceB.invoiceDescription
              ? -1 * asc
              : 0;
          case 2:
            if (
              statusColorMapOrder(invoiceA.invoiceStatus.color) == statusColorMapOrder(invoiceB.invoiceStatus.color)
            ) {
              return invoiceA.invoiceStatus.label > invoiceB.invoiceStatus.label
                ? asc
                : invoiceA.invoiceStatus.label < invoiceB.invoiceStatus.label
                ? -1 * asc
                : 0;
            }
            return statusColorMapOrder(invoiceA.invoiceStatus.color) > statusColorMapOrder(invoiceB.invoiceStatus.color)
              ? asc
              : statusColorMapOrder(invoiceA.invoiceStatus.color) < statusColorMapOrder(invoiceB.invoiceStatus.color)
              ? -1 * asc
              : 0;
          case 3:
            return invoiceA.totalAmount > invoiceB.totalAmount
              ? asc
              : invoiceA.totalAmount < invoiceB.totalAmount
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
    isShown: true,
    isColumnSortable: l.sortable,
    screenReaderOnly: l.screenReaderOnly,
  }));
  const rows: ZebraTableColumn[][] = invoicesList.map((r, idx) => [
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Förfallodatum: </span>
          <span className="block xl:w-[14rem]">{r.dueDate}</span>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Faktura: </span>
          <span className="block xl:w-[14rem]">{r.invoiceDescription}</span>
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
              className={`w-[14px] max-h-[14px] h-[14px] bg-${statusColorMap(r.invoiceStatus.color)} mr-2`}
            />
            {r.invoiceStatus.label}
          </span>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">Summa: </span>
          <span className="block xl:w-[14rem]">{r.totalAmount}</span>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Fragment key={`mr${idx}`}>
          <span className="inline lg:hidden">OCR-nummer: </span>
          <span className="block xl:w-[14rem]">{r.ocrNumber}</span>
        </Fragment>
      ),
      isShown: true,
    },
    {
      element: (
        <Button
          aria-label={`Visa faktura ${r.invoiceDescription}`}
          key={`mr${idx}`}
          variant="solid"
          color="primary"
          loading={isLoading?.[r.invoiceNumber]}
          loadingText="Hämtar"
          className="w-full xl:w-auto px-md"
          onClick={() => getPdf(r.invoiceNumber)}
        >
          Visa faktura <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
        </Button>
      ),
      isShown: true,
    },
  ]);

  const table = (
    <>
      {props.data.invoices.length !== 0 && !isLoadingInvoices && (
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
      {props.data.invoices.length === 0 && !isLoadingInvoices ? (
        <p className="px-lg w-3/5">{`Det finns inga ${props.heading.toLowerCase()}`}</p>
      ) : rows?.length > 0 ? (
        <></>
      ) : isLoadingInvoices ? (
        <p className="px-lg w-3/5">{`Laddar ${props.heading.toLowerCase()}`}</p>
      ) : (
        <p className="px-lg w-3/5">{`Det gick inte att hämta ${props.heading.toLowerCase()}`}</p>
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
      />
    </>
  );

  useEffect(() => {
    setLabels(props.data.labels);
    if (0 in props.data.labels) {
      setSelectedSortAction(props.data.labels[0].label);
    }
    setInvoicesList((JSON.parse(JSON.stringify(props.data.invoices)) as IInvoice[]) || []);
    sortHandler(defaultSort.idx, defaultSort.sortMode);
  }, [props.data, sortHandler, defaultSort.idx, defaultSort.sortMode]);

  return (
    <div ref={ref}>
      <CasesComponent
        header={
          <>
            {isLoadingInvoices ? (
              <span>{`Laddar ${props.heading.toLowerCase()}`}</span>
            ) : (
              <span>
                {`${props.heading}`} ({props.data?.invoices?.length})
              </span>
            )}
          </>
        }
        helpText={props.helpText}
        disclosureIsOpen={disclosureIsOpen}
        setDisclosureIsOpenCallback={(open) => setDisclosureIsOpen(open)}
      >
        {table}
      </CasesComponent>
    </div>
  );
};
