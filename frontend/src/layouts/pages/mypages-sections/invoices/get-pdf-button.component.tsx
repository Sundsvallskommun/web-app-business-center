import { IInvoice } from '@interfaces/invoice';
import { getInvoicePdf } from '@services/invoice-service';
import { Button, Icon, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { ArrowDownToLine } from 'lucide-react';

export const GetPdfButton: React.FC<{
  isLoading?: { [key: string]: boolean };
  setIsLoading?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  item: IInvoice;
}> = ({ isLoading, setIsLoading, item }) => {
  const message = useSnackbar();
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
