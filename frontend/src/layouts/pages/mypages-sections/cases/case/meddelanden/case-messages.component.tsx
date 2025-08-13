import { Button, Divider } from '@sk-web-gui/react';
import { useContext, useState } from 'react';
import { CaseContext } from '../case-layout.component';
import CaseMessage from './case-message.component';

const PAGESIZE = 24;

export default function CaseMessages() {
  const { caseMessages } = useContext(CaseContext);
  const [visibleMessages, setVisibleMessages] = useState(PAGESIZE);
  const showMoreMessages = () => setVisibleMessages((prev) => prev + PAGESIZE);

  return (
    <div className="flex flex-col gap-y-16 items-start self-stretch mx-20 desktop:mx-32">
      <div className="text-secondary w-full">
        <span>{caseMessages?.length ? `${caseMessages.length} meddelanden` : `Inga meddelanden`}</span>
        <Divider className="mx-0 mb-0 mt-16" />
      </div>
      {caseMessages?.length ? (
        <>
          <ul aria-label="Ärendemeddelanden" className="case-messages flex flex-col self-stretch gap-y-8">
            {caseMessages?.slice(0, visibleMessages).map((message, index) => {
              return (
                <li key={index} className="flex flex-col gap-y-8">
                  <CaseMessage message={message} />
                  {index !== caseMessages.length - 1 ? <Divider className="m-0" /> : null}
                </li>
              );
            })}
          </ul>
          <div className="w-full">
            {!(visibleMessages < (caseMessages?.length || 0)) ? <Divider className="mb-16" /> : null}
            <div className="flex flex-col gap-y-12 items-center self-stretch">
              <div className="text-secondary text-small">
                Visar {Math.min(visibleMessages, caseMessages?.length || 0)} av {caseMessages?.length}
              </div>
              <div>
                {visibleMessages < (caseMessages?.length || 0) ? (
                  <Button variant="secondary" onClick={showMoreMessages}>
                    Visa fler
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
