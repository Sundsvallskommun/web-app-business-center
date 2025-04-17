import { useContext } from 'react';
import { CaseContext } from '../case-layout.component';
import { Card } from '@components/cards/card.component';

export default function CaseInformation() {
  const { caseData } = useContext(CaseContext);
  return (
    <Card className="gap-y-24">
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Ärendenummer</div>
          <div>{caseData?.errandNumber}</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Registrerat</div>
          <div>{caseData?.firstSubmitted}</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Dokument</div>
          <div>?</div>
        </div>
      </div>
    </Card>
  );
}
