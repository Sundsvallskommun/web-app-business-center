import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useAppContext } from '@contexts/app.context';
import { InvoicesData } from '@interfaces/invoice';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { getInvoicePdf } from '@services/invoice-service';
import { AutoTable, AutoTableHeader, Badge, Button, useSnackbar } from '@sk-web-gui/react';
import { statusColorMap } from '@utils/status-color';
import _ from 'lodash';
import { Fragment, useEffect, useRef, useState } from 'react';

export const InvoicesTable: React.FC<{
  data?: InvoicesData;
  heading: React.ReactNode;
  isLoadingData: boolean;
}> = (props) => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>();
  const message = useSnackbar();
  const ref = useRef<null | HTMLDivElement>(null);

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
      label: 'Namn',
      sticky: true,
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
              <Badge className={`w-[14px] max-h-[14px] h-[14px] ${statusColorMap(item.invoiceStatus.color).bg} mr-2`} />
              {item.invoiceStatus.label}
            </span>
          </Fragment>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Förfallodatum',
      sticky: false,
      property: 'dueDate',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Fakturabelopp',
      sticky: false,
      property: 'totalAmount',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Fakturanummer/OCR-nummer',
      sticky: false,
      property: 'ocrNumber',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Hämta faktura',
      sticky: false,
      property: 'dueDate',
      screenReaderOnly: true,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Button
            aria-label={`Hämta faktura ${item.invoiceDescription}`}
            color="primary"
            loading={isLoading?.[item.invoiceNumber]}
            loadingText="Hämtar"
            className="w-full xl:w-auto px-md"
            onClick={() => getPdf(item.invoiceNumber)}
          >
            Hämta faktura <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
          </Button>
        </div>
      ),
      isColumnSortable: false,
    },
  ];

  const Table = () => {
    return (
      <>
        {props.data && props.data?.invoices?.length === 0 && !props.isLoadingData ? (
          <p>Inga fakturor</p>
        ) : props.data && props.data?.invoices?.length > 0 ? (
          <></>
        ) : (
          props.isLoadingData && <p>Laddar fakturor</p>
        )}
        {props.data && props.data?.invoices?.length > 0 && (
          <div>
            <AutoTable pageSize={9999} footer={false} autodata={props.data?.invoices} autoheaders={headers} />
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={ref}>
      <TableWrapper header={props.heading}>
        <Table />
      </TableWrapper>
    </div>
  );
};
