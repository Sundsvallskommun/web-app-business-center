import { Divider, Label } from '@sk-web-gui/react';
import { useContext } from 'react';
import { CaseContext } from '../case-layout.component';

export default function CaseInformation() {
  const { caseData } = useContext(CaseContext);
  return (
    <div>
      <h1>Uppgifter</h1>
      <div className="mt-24 border-1 border-divider rounded-cards p-20 desktop:p-32 flex flex-col gap-y-24 desktop:gap-y-40">
        <div className="flex flex-col gap-y-24 items-start">
          <Label rounded inverted color={caseData?.status.color}>
            {caseData?.status.label}
          </Label>
          <h2 className="text-h2-sm desktop:text-h2-lg">{caseData?.subject.caseType}</h2>
        </div>
        <Divider />
        <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Ärendenummer</div>
            <div>{caseData?.caseId}</div>
          </div>
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Registrerat</div>
            <div>{caseData?.serviceDate}</div>
          </div>
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Dokument</div>
            <div>?</div>
          </div>
        </div>
      </div>
    </div>
  );
}
