import { Button, Card, LucideIcon, Label } from '@sk-web-gui/react';
import { IInvoice } from '@interfaces/invoice';
import dayjs from 'dayjs';
import { GetPdfButton } from './get-pdf-button.component';
import { useState } from 'react';

export const InvoiceTableCard: React.FC<{ item: IInvoice }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Card.Body className="w-full py-12 pl-24 pr-12">
        <div className="flex items-start">
          <div className="w-full">
            <div className="flex flex-col-reverse mb-24">
              <div className="font-bold text-lead">{item.invoiceDescription}</div>
              <div>
                <Label
                  rounded
                  inverted={item.invoiceStatus?.color !== 'neutral'}
                  color={item.invoiceStatus?.color}
                  className={`whitespace-nowrap my-12`}
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

              {open && (
                <div>
                  <div className="flex gap-x-8">
                    <strong>Fakturanummer/OCR-nummer</strong>
                    <span>{item.ocrNumber}</span>
                  </div>
                  <div className="flex gap-x-8 mt-24">
                    <GetPdfButton item={item} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <Button
              aria-label={`${open ? 'Stäng' : 'Öppna'} fakturakort`}
              variant="tertiary"
              size="lg"
              showBackground={false}
              rounded
              iconButton
              onClick={() => setOpen((open) => !open)}
            >
              <LucideIcon name={open ? 'chevron-up' : 'chevron-down'} />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
