'use client';

import { Button, Divider, Spinner } from '@sk-web-gui/react';
import { ArrowDown, MessageSquare } from 'lucide-react';
import { UIEvent, useContext, useEffect, useRef, useState } from 'react';
import { CaseContext } from '../case-layout.component';
import CaseMessage from './case-message.component';
import { formatDateDivider } from './utils';

// Messages are revealed in pages so a long thread doesn't render all at once.
const PAGE_SIZE = 24;

export default function CaseMessages() {
  const { caseMessages } = useContext(CaseContext);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messages = caseMessages ?? [];
  const isLoading = caseMessages === undefined;
  // Reveal from the end so the newest messages are visible first; "Visa äldre" pages backwards.
  const visible = messages.slice(Math.max(messages.length - visibleCount, 0));
  const hasMore = visibleCount < messages.length;
  const latestId = messages.length ? messages[messages.length - 1].messageId : undefined;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const updateScrollButton = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    setShowScrollButton(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  // Stick to the newest message whenever the thread grows (initial load + after sending).
  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom('auto'));
  }, [messages.length]);

  return (
    <div className="relative min-h-[260px] bg-background-100">
      {isLoading ? (
        <div className="min-h-[260px] flex items-center justify-center">
          <Spinner size={3} />
        </div>
      ) : messages.length ? (
        <div
          ref={scrollAreaRef}
          className="max-h-[min(62vh,600px)] overflow-y-auto px-16 py-20 desktop:px-32"
          onScroll={updateScrollButton}
          role="log"
          aria-label="Ärendemeddelanden"
          aria-live="polite"
        >
          {hasMore ? (
            <div className="flex justify-center pb-16">
              <Button size="sm" variant="secondary" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                Visa äldre meddelanden
              </Button>
            </div>
          ) : null}
          <ul className="case-messages flex flex-col gap-y-16">
            {visible.map((message, index) => (
              <li key={message.messageId ?? index} className="flex flex-col gap-y-12">
                {index === 0 || formatDateDivider(message.sent) !== formatDateDivider(visible[index - 1]?.sent) ? (
                  <div className="flex items-center gap-12">
                    <Divider className="m-0 grow" />
                    <span className="text-small text-secondary whitespace-nowrap">
                      {formatDateDivider(message.sent)}
                    </span>
                    <Divider className="m-0 grow" />
                  </div>
                ) : null}
                <CaseMessage message={message} isLatest={message.messageId === latestId} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="min-h-[260px] flex flex-col items-center justify-center gap-12 text-center text-secondary px-20">
          <MessageSquare size={42} />
          <div>
            <p className="font-bold text-body m-0">Inga meddelanden än</p>
            <p className="m-0 text-small">Skriv ett meddelande nedan för att starta dialogen.</p>
          </div>
        </div>
      )}
      {showScrollButton ? (
        <Button
          className="absolute bottom-16 right-16 shadow-lg"
          size="sm"
          color="vattjom"
          iconButton
          aria-label="Gå till senaste meddelandet"
          leftIcon={<ArrowDown />}
          onClick={() => scrollToBottom()}
        />
      ) : null}
    </div>
  );
}
