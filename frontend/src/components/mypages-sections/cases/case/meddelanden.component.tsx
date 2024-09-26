import { CaseContext } from '@components/mypages-sections/cases/case/case-layout.component';
import { useContext } from 'react';

export default function CaseMeddelanden() {
  const { caseData } = useContext(CaseContext);
  console.log('caseData', caseData);
  return (
    <div>
      <h1>Meddelanden</h1>
    </div>
  );
}
