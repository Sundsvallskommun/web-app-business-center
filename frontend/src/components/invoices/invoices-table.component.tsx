import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { IInvoice, InvoicesData } from '@interfaces/invoice';
import { AutoTable, AutoTableHeader, Label } from '@sk-web-gui/react';
import { useRef, useState } from 'react';
import { useWindowSize } from '../../utils/use-window-size.hook';
import { CardList } from '../cards/cards.component';
import { GetPdfButton } from './get-pdf-button.component';
import { InvoiceTableCard } from './invoices-table-card.component';

export const InvoicesTable: React.FC<{
  data?: InvoicesData;
  heading: React.ReactNode;
  isFetchingData: boolean;
}> = (props) => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>();
  const ref = useRef<null | HTMLDivElement>(null);
  const windowSize = useWindowSize();

  const headers: Array<AutoTableHeader | string> = [
    {
      label: 'Namn',
      sticky: true,
      property: 'invoiceDescription',
      screenReaderOnly: false,
      isColumnSortable: true,
      renderColumn: (value) => <div className="text-left text-small font-bold">{value}</div>,
    },
    {
      label: 'Status',
      sticky: false,
      property: 'invoiceStatus.label',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Label
            rounded
            inverted={item.invoiceStatus?.color !== 'neutral'}
            color={item.invoiceStatus?.color}
            className={`whitespace-nowrap `}
          >
            {value}
          </Label>
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
      renderColumn: (value) => <div className="text-left">{value}</div>,
    },
    {
      label: 'Belopp',
      sticky: false,
      property: 'totalAmount',
      screenReaderOnly: false,
      isColumnSortable: true,
      renderColumn: (value) => <div className="text-left">{value}</div>,
    },
    {
      label: 'Fakturanummer/OCR',
      sticky: false,
      property: 'ocrNumber',
      screenReaderOnly: false,
      isColumnSortable: true,
      renderColumn: (value) => <div className="text-left">{value}</div>,
    },
    {
      label: 'Hämta faktura',
      sticky: false,
      property: 'dueDate',
      screenReaderOnly: true,
      renderColumn: (value, item: IInvoice) => (
        <div className="text-left">
          <GetPdfButton isLoading={isLoading} setIsLoading={setIsLoading} item={item} />
        </div>
      ),
      isColumnSortable: false,
    },
  ];

  const Table = () => {
    return (
      <>
        {props.data && props.data?.invoices?.length === 0 && !props.isFetchingData ? (
          <p>Inga fakturor</p>
        ) : props.data && props.data?.invoices?.length > 0 ? (
          <></>
        ) : (
          props.isFetchingData && <p>Laddar fakturor</p>
        )}
        {props.data && props.data?.invoices?.length > 0 && (
          <div>
            {windowSize.lg ? (
              <AutoTable
                className="[&_table]:table-fixed"
                wrappingBorder
                pageSize={9999}
                footer={false}
                background={false}
                autodata={props.data?.invoices}
                autoheaders={headers}
              />
            ) : (
              <CardList data={props.data?.invoices} Card={InvoiceTableCard} />
            )}
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
