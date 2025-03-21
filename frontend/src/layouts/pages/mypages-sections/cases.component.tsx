import { ClosedCases } from './cases/closed-cases/closed-cases.component';
import { OngoingCases } from './cases/ongoing-cases/ongoing-cases.component';

export default function Cases() {
  return (
    <div className="flex flex-col gap-40">
      <div className="text-content">
        <h1>Ärenden</h1>
        <p className="ingress">
          Qorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet
          odio mattis.
        </p>
      </div>
      <div>
        <OngoingCases header={<h2 className="text-h3">Pågående</h2>} />
      </div>
      <div>
        <ClosedCases header={<h2 className="text-h3">Avslutade</h2>} />
      </div>
    </div>
  );
}
