import { Card } from '@components/cards/card.component';
import { getCasePdf } from '@services/case-service';
import { downloadBlob } from '@utils/download-blob';
import { Button, Icon } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { File } from 'lucide-react';
import { useCallback, useContext, useState } from 'react';
import { CaseContext } from '../case-layout.component';

export default function CaseInformation() {
  const { caseData } = useContext(CaseContext);
  const [pdfIsLoading, setPdfIsLoading] = useState(false);

  const handleGetPdf = useCallback(async () => {
    if (!caseData?.caseId) return;
    setPdfIsLoading(true);
    const attachment = await getCasePdf(caseData?.caseId); // returns base64 string
    downloadBlob(attachment, 'application/pdf', `${caseData?.caseId}.pdf`);
    setPdfIsLoading(false);
  }, [caseData?.caseId]);

  const firstSubmittedValid = !!caseData?.firstSubmitted;

  return (
    <Card>
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Ärendenummer</div>
          <div>{caseData?.errandNumber || caseData?.caseId}</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Registrerat</div>
          <div>{firstSubmittedValid ? dayjs(caseData?.firstSubmitted).format('YYYY-MM-DD HH:mm') : 'Datum saknas'}</div>
        </div>
        {caseData?.system === 'OPEN_E_PLATFORM' ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Dokument</div>
            <div>
              <Button loading={pdfIsLoading} className="flex gap-4 items-center" variant="link" onClick={handleGetPdf}>
                <Icon size="1.8rem" icon={<File />} />
                <span>Ladda ner ärendet (pdf)</span>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
