import { IInvoice } from '@interfaces/invoice';
import { getInvoicePdf } from '@services/invoice-service';
import { downloadBlob } from '@utils/download-blob';
import { Button, Icon, useThemeQueries } from '@sk-web-gui/react';
import { ArrowDownToLine } from 'lucide-react';

export const GetPdfButton: React.FC<{
  isLoading?: { [key: string]: boolean };
  setIsLoading?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  item: IInvoice;
}> = ({ isLoading, setIsLoading, item }) => {
  const { isMinDesktop } = useThemeQueries();

  const getPdf = (invoiceNumber: string) => {
    if (setIsLoading) {
      setIsLoading((old) => {
        const newObj = { ...old };
        newObj[invoiceNumber] = true;
        return newObj;
      });
    }
    getInvoicePdf(invoiceNumber)
      .then((d) => {
        if (typeof d.error === 'undefined') {
          downloadBlob(d.pdf.file, 'application/pdf', `${invoiceNumber}.pdf`);
        }
      })
      .finally(() => {
        if (setIsLoading) {
          setIsLoading((old) => {
            const newObj = { ...old };
            newObj[invoiceNumber] = false;
            return newObj;
          });
        }
      });
  };

  return (
    <Button
      aria-label={`Hämta faktura ${item.invoiceDescription}`}
      className="w-full mb-4 mt-16"
      size={isMinDesktop ? 'sm' : 'lg'}
      variant="secondary"
      loading={isLoading?.[item.invoiceNumber]}
      loadingText="Hämtar"
      onClick={() => getPdf(item.invoiceNumber)}
      rightIcon={<Icon icon={<ArrowDownToLine />} />}
    >
      Hämta faktura
    </Button>
  );
};
