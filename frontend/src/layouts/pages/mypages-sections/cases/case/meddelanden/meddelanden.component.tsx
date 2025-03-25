import { Divider } from '@sk-web-gui/react';
import CaseNewMessage from './case-new-message.component';
import CaseMessages from './case-messages.component';

export default function CaseMeddelanden() {
  return (
    <div className="flex flex-col gap-y-24">
      <div>
        <h1>Meddelanden</h1>
        <p>På denna sida har du möjlighet att kommunicera med handläggaren om ditt ärende.</p>
      </div>
      <div className="border-1 border-divider rounded-cards py-32 self-stretch gap-y-64 flex flex-col items-center">
        <div className="flex flex-col gap-y-32 self-stretch">
          <CaseNewMessage />
          <Divider className="m-0 self-stretch" />
        </div>
        <CaseMessages />
      </div>
    </div>
  );
}
