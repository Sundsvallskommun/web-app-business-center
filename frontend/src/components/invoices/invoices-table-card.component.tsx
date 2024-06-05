import { Card, Label } from '@sk-web-gui/react';
import { IInvoice } from '../../interfaces/invoice';
import dayjs from 'dayjs';

export const InvoiceTableCard: React.FC<{ item: IInvoice }> = ({ item }) => {
  return (
    <Card>
      <Card.Body className="w-full pt-24">
        <div className="flex flex-col-reverse mb-24">
          <div className="font-bold text-lead">{item.invoiceDescription}</div>
          <div>
            <Label
              rounded
              inverted={item.invoiceStatus?.color !== 'neutral'}
              color={item.invoiceStatus?.color}
              className={`whitespace-nowrap mb-12`}
            >
              {item?.invoiceStatus?.label}
            </Label>
          </div>
        </div>
        <div>
          <div className="flex gap-x-8">
            <strong>Förfallodatum</strong>
            <span>{dayjs(item.dueDate).format('YYYY-MM-DD')}</span>
          </div>
          <div className="flex gap-x-8">
            <strong>Fakturabelopp</strong>
            <span>{item.totalAmount}</span>
          </div>
          <div className="flex gap-x-8">
            <strong>Fakturanummer/OCR-nummer</strong>
            <span>{item.ocrNumber}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
