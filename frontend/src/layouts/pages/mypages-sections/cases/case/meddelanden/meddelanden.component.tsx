import { Divider } from '@sk-web-gui/react';
import CaseMessages from './case-messages.component';
import CaseNewMessage from './case-new-message.component';

export default function CaseMeddelanden() {
  return (
    <div className="flex flex-col gap-y-24">
      <div className="rounded-cards py-32 self-stretch gap-y-48 desktop:gap-y-64 flex flex-col items-center bg-background-content shadow-50">
        <div className="flex flex-col gap-y-32 self-stretch">
          <CaseNewMessage />
          <Divider className="m-0 self-stretch" />
        </div>
        <CaseMessages />
      </div>
    </div>
  );
}
