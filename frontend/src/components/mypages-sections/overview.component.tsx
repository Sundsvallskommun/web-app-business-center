import { OngoingCases } from '../cases/ongoing-cases/ongoing-cases.component';

export default function Overview() {
  return (
    <div>
      <h1 className="mb-32">Pågående ärenden</h1>
      <OngoingCases />
    </div>
  );
}
