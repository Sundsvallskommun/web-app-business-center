import { IInvoice } from '@interfaces/invoice';
import { Button, Card, Divider, Icon, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { GetPdfButton } from './get-pdf-button.component';

export const InvoiceTableCard: React.FC<{ item: IInvoice }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Card.Body className="w-full py-12 pl-24 pr-12">
        <div className="flex items-start">
          <div className="w-full flex flex-col gap-y-16">
            <div className="flex flex-col-reverse">
              <div className="flex justify-between gap-x-8 text-large font-bold">
                <h3 className="text-large font-bold">{item.invoiceDescription}</h3>
                <div className="flex gap-x-8">
                  <span>{`${item.totalAmount} kr`}</span>
                </div>
              </div>
              <div>
                <Label
                  rounded
                  inverted={item.invoiceStatus?.color !== 'neutral'}
                  color={item.invoiceStatus?.color}
                  className={`my-12`}
                >
                  {item?.invoiceStatus?.label}
                </Label>
              </div>
            </div>
            <div className="flex gap-x-8">
              <span>Förfallodatum: </span>
              <span>{dayjs(item.dueDate).format('YYYY-MM-DD')}</span>
            </div>

            {open && (
              <>
                <div className="flex gap-x-8">
                  <span>Referensnummer/OCR: </span>
                  <span>{item.ocrNumber}</span>
                </div>
                <GetPdfButton item={item} />
              </>
            )}
            <Divider className="mb-0 mt-8" />
            <Button
              variant="tertiary"
              className="w-full"
              showBackground={false}
              rounded
              rightIcon={open ? <Icon icon={<ChevronUp />} /> : <Icon icon={<ChevronDown />} />}
              onClick={() => setOpen((open) => !open)}
            >
              <span>{`Visa ${open ? 'mindre' : 'mer'}`}</span>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
