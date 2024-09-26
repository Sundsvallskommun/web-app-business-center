import { CaseContext } from '@components/mypages-sections/cases/case/case-layout.component';
import { useContext } from 'react';

export default function CaseInformation() {
  const { caseData } = useContext(CaseContext);
  console.log('caseData', caseData);
  return (
    <div>
      <h1>Information</h1>
    </div>
  );
}
