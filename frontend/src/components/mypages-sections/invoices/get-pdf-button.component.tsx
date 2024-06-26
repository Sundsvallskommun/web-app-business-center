import { IInvoice } from '@interfaces/invoice';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { getInvoicePdf } from '@services/invoice-service';
import { Button, useSnackbar, useThemeQueries } from '@sk-web-gui/react';

export const GetPdfButton: React.FC<{
  isLoading?: { [key: string]: boolean };
  setIsLoading?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  item: IInvoice;
}> = ({ isLoading, setIsLoading, item }) => {
  const message = useSnackbar();
  const { isMinDesktop } = useThemeQueries();

  const getPdf = (invoiceNumber: string) => {
    setIsLoading &&
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
        setIsLoading &&
          setIsLoading((old) => {
            const newObj = { ...old };
            newObj[invoiceNumber] = false;
            return newObj;
          });
      });
  };

  return (
    <Button
      aria-label={`Hämta faktura ${item.invoiceDescription}`}
      size={isMinDesktop ? 'sm' : 'lg'}
      variant="secondary"
      loading={isLoading?.[item.invoiceNumber]}
      loadingText="Hämtar"
      onClick={() => getPdf(item.invoiceNumber)}
      rightIcon={<FileDownloadOutlinedIcon />}
    >
      Hämta faktura
    </Button>
  );
};
