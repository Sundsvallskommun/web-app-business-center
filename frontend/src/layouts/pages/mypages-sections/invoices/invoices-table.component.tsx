import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { InvoicesData } from '@interfaces/invoice';
import { sortInvoices } from '@services/invoice-service';
import { Label, Table, useThemeQueries } from '@sk-web-gui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceTableCard } from './invoices-table-card.component';

export const InvoicesTable: React.FC<{
  data?: InvoicesData;
  heading: React.ReactNode;
  isFetchingData: boolean;
}> = (props) => {
  // const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>();
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('invoice');

  const datarows = props.data?.invoices.sort(sortInvoices).map((item, idx: number) => {
    return (
      <Table.Row key={`row-${idx}`}>
        <Table.Column>
          <div className="text-left text-small font-bold">{item.invoiceDescription}</div>
        </Table.Column>
        <Table.Column>
          <div className="text-left">
            <Label rounded inverted={item.invoiceStatus?.color !== 'neutral'} color={item.invoiceStatus?.color}>
              {item.invoiceStatus.label}
            </Label>
          </div>
        </Table.Column>
        <Table.Column>
          <div className="text-left">{item.dueDate}</div>
        </Table.Column>
        <Table.Column>
          <div className="text-left">{`${item.totalAmount} kr`}</div>
        </Table.Column>
        <Table.Column>
          <div className="text-left">{item.ocrNumber}</div>
        </Table.Column>
        {/* <Table.Column>
          Disabled until third-party modifications are made
           <div className="text-left">
            <GetPdfButton isLoading={isLoading} setIsLoading={setIsLoading} item={item} />
          </div> 
        </Table.Column> */}
      </Table.Row>
    );
  });

  const TableComponent = () => {
    return (
      <>
        {props.data && props.data?.invoices?.length === 0 && !props.isFetchingData ? (
          <p>{t('invoice:table.empty')}</p>
        ) : props.data && props.data?.invoices?.length > 0 ? (
          <></>
        ) : (
          props.isFetchingData && <p>{t('invoice:table.loading')}</p>
        )}
        {props.data && props.data?.invoices?.length > 0 && (
          <div>
            {isMinDesktop ? (
              <Table background>
                <Table.Header className="bg-background-content border-b-1 border-secondary-outline-hover">
                  <Table.HeaderColumn>{t('invoice:table.name')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:table.status')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:table.dueDate')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:table.amount')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:table.reference')}</Table.HeaderColumn>
                  <Table.HeaderColumn className="sr-only">{t('invoice:table.download')}</Table.HeaderColumn>
                </Table.Header>
                <Table.Body>{datarows}</Table.Body>
              </Table>
            ) : (
              <CardList
                data={props.data?.invoices}
                Card={InvoiceTableCard}
                amountDisplayed={9999}
                showAmountString={false}
              />
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={ref}>
      <TableWrapper header={props.heading}>
        <TableComponent />
      </TableWrapper>
    </div>
  );
};
