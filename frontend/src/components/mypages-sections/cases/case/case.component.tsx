import { CaseResponse, ICase } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { handleCase } from '@services/case-service';

export default function Case(props: { caseId: number }) {
  const { data: caseData } = useApi<CaseResponse, Error, ICase>({
    url: `/case/${props.caseId}`,
    method: 'get',
    dataHandler: handleCase,
  });
  console.log('caseData', caseData);
  return <div>Case</div>;
}
