import { ClosedCases } from '../closed-cases/closed-cases.component';
import { OngoingCases } from '../ongoing-cases/ongoing-cases.component';

export default function Cases() {
  return (
    <div>
      <h1>Ärenden</h1>
      <OngoingCases />
      <ClosedCases />
    </div>
  );
}
