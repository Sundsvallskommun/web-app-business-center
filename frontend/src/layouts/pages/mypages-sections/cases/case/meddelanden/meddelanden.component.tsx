'use client';

import { FrontendMessageResponse } from '@interfaces/case';
import { useContext, useState } from 'react';
import { CaseContext } from '../case-layout.component';
import CaseMessages from './case-messages.component';
import CaseNewMessage from './case-new-message.component';

// Systems whose message API carries a reply reference (see backend inReplyToId plumbing).
const REPLY_SYSTEMS = ['CARE_MANAGEMENT', 'CASE_DATA', 'SUPPORT_MANAGEMENT'];

export default function CaseMeddelanden() {
  const { caseData, caseMessages } = useContext(CaseContext);
  const [replyTo, setReplyTo] = useState<FrontendMessageResponse | undefined>(undefined);
  const count = caseMessages?.length ?? 0;
  const supportsReply = !!caseData?.system && REPLY_SYSTEMS.includes(caseData.system);

  return (
    <div className="flex flex-col gap-y-24">
      <div className="rounded-cards bg-background-content shadow-50 flex flex-col overflow-hidden">
        <div className="border-b-1 border-divider px-20 py-16 desktop:px-32">
          <div className="flex flex-col gap-8 desktop:flex-row desktop:items-center desktop:justify-between">
            <div>
              <h2 className="text-large font-bold m-0">Meddelanden</h2>
              <p className="text-small text-secondary m-0">
                {count ? `${count} ${count === 1 ? 'meddelande' : 'meddelanden'}` : 'Inga meddelanden'}
              </p>
            </div>
            <span className="text-small text-secondary">Äldst överst, senaste längst ned</span>
          </div>
        </div>

        <CaseMessages canReply={supportsReply} onReply={setReplyTo} />

        <div className="border-t-1 border-divider bg-background-content px-20 py-16 desktop:px-32">
          <CaseNewMessage replyTo={replyTo} onCancelReply={() => setReplyTo(undefined)} />
        </div>
      </div>
    </div>
  );
}
