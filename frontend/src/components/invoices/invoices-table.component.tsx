import { CasesComponent } from '@components/cases-component/cases-component';
import { useAppContext } from '@contexts/app.context';
import { InvoicesData } from '@interfaces/invoice';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useLocalStorageValue } from '@react-hookz/web';
import { getInvoicePdf } from '@services/invoice-service';
import { AutoTable, AutoTableHeader, Badge, Button, useSnackbar } from '@sk-web-gui/react';
import { statusColorMap } from '@utils/status-color';
import _ from 'lodash';
import { Fragment, useEffect, useRef, useState } from 'react';

export const InvoicesTable: React.FC<{
  data?: InvoicesData;
  heading: string;
  helpText: string;
  isLoadingData: boolean;
}> = (props) => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>();
  const message = useSnackbar();
  const ref = useRef<null | HTMLDivElement>(null);

  const localstorageKey = `invoices-${props.heading.toLowerCase()}-component`;
  const { value: disclosureIsOpen, set: setDisclosureIsOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: true,
    initializeWithValue: true,
  });
  const { highlightedTableRow, setHighlightedTableRow } = useAppContext();
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number>();
  const [timeoutRef, setTimeoutRef] = useState<string | number | NodeJS.Timeout>();

  useEffect(() => {
    if (!_.isEmpty(highlightedTableRow)) {
      const itemIndex = props.data?.invoices?.findIndex(
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
  }, [highlightedTableRow, props.data?.invoices]);

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

  const headers: Array<AutoTableHeader | string> = [
    {
      label: 'Förfallodatum',
      sticky: true,
      property: 'dueDate',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Faktura',
      sticky: false,
      property: 'invoiceDescription',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Status',
      sticky: false,
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Fragment>
            <span className="flex items-center xl:w-[20rem]">
              <Badge className={`w-[14px] max-h-[14px] h-[14px] bg-${statusColorMap(item.invoiceStatus.color)} mr-2`} />
              {item.invoiceStatus.label}
            </span>
          </Fragment>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Summa',
      sticky: false,
      property: 'totalAmount',
      screenReaderOnly: true,
      isColumnSortable: false,
    },
    {
      label: 'OCR-nummer',
      sticky: true,
      property: 'ocrNumber',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Visa faktura',
      sticky: true,
      property: 'dueDate',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Button
            aria-label={`Visa faktura ${item.invoiceDescription}`}
            color="primary"
            loading={isLoading?.[item.invoiceNumber]}
            loadingText="Hämtar"
            className="w-full xl:w-auto px-md"
            onClick={() => getPdf(item.invoiceNumber)}
          >
            Visa faktura <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
          </Button>
        </div>
      ),
      isColumnSortable: true,
    },
  ];

  const table = (
    <>
      {props.data && props.data?.invoices?.length === 0 && !props.isLoadingData ? (
        <p>{`Det finns inga ${props.heading.toLowerCase()}`}</p>
      ) : props.data && props.data?.invoices?.length > 0 ? (
        <></>
      ) : (
        props.isLoadingData && <p>{`Laddar ${props.heading.toLowerCase()}`}</p>
      )}
      {props.data && props.data?.invoices?.length > 0 && (
        <div>
          <AutoTable autodata={props.data?.invoices} autoheaders={headers} />
        </div>
      )}
    </>
  );

  return (
    <div ref={ref}>
      <CasesComponent
        header={
          <>
            {props.isLoadingData ? (
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
