import { useContext } from 'react';
import { CaseContext } from '../case-layout.component';

export default function CaseInformation() {
  const { caseData } = useContext(CaseContext);
  return (
    <div>
      <div className="mt-24 border-1 border-divider rounded-cards p-20 desktop:p-32 flex flex-col gap-y-24 desktop:gap-y-40">
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
      </div>
    </div>
  );
}
