import CaseMessage from '@components/mypages-sections/cases/case/meddelanden/case-message.component';
import { Button, Divider } from '@sk-web-gui/react';

export default function CaseMessages() {
  return (
    <div className="flex flex-col gap-y-16 items-start self-stretch mx-32">
      <div className="text-secondary w-full">14 meddelanden</div>
      <div className="case-messages flex flex-col self-stretch gap-y-8">
        <Divider className="m-0" />
        {[...Array.from([1, 2, 3])].map((x, index) => {
          return (
            <>
              <CaseMessage key={`${index}`} />
              {index < 2 && <Divider className="m-0" />}
            </>
          );
        })}
        <Divider className="m-0" />
      </div>
      <div className="flex flex-col gap-y-12 items-center self-stretch">
        <div className="text-secondary text-small">Visar 12 av 14</div>
        <div>
          <Button color="vattjom">Visa fler</Button>
        </div>
      </div>
    </div>
  );
}
