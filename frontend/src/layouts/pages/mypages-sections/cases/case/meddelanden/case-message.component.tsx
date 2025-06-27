import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import sanitized from '@services/sanitizer-service';
import { Avatar, AvatarProps } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import CaseMessageFiles from './case-message-files.component';
import { FrontendMessageResponse } from '@interfaces/case';

export default function CaseMessage(props: { message: FrontendMessageResponse }) {
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const { message } = props;
  const sender =
    message.direction === 'OUTBOUND'
      ? `${message.sender} (Handläggare)`
      : user?.name === message.sender
        ? 'Jag'
        : message.sender;

  const avatarSettings: { color: AvatarProps['color']; initials: string } =
    message.direction === 'OUTBOUND'
      ? {
          color: 'bjornstigen',
          initials: 'H',
        }
      : { color: 'gronsta', initials: 'J' };

  // TODO: Uncomment when the API supports it
  // const { caseData } = useContext(CaseContext);
  // const putMessageIsViewed = useApi({
  //   url: `/cases/${caseData?.caseId}/messages/${message.messageId}/viewed/true`,
  //   method: 'put',
  // });
  // const messageRef = useRef<HTMLDivElement>(null);
  // const hasTriggered = useRef(false);

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       if (
  //         entry.isIntersecting &&
  //         message.direction === 'OUTBOUND' &&
  //         !messageIsViewed(message) &&
  //         caseData?.caseId &&
  //         !hasTriggered.current
  //       ) {
  //         hasTriggered.current = true;
  //         putMessageIsViewed.mutateAsync({}).catch(() => {
  //           console.error('Could not set message as viewed', message.messageId);
  //         });
  //       }
  //     },
  //     { threshold: 0.1 }
  //   );

  //   const currentMessageRef = messageRef.current;
  //   if (currentMessageRef) {
  //     observer.observe(currentMessageRef);
  //   }

  //   return () => {
  //     if (currentMessageRef) {
  //       observer.unobserve(currentMessageRef);
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [message.viewed, caseData?.caseId]);

  return (
    <div /**ref={messageRef}**/ className="case-message flex flex-col gap-y-16 py-20 px-8">
      <div className="case-message-header flex gap-16">
        <Avatar color={avatarSettings.color} initials={avatarSettings.initials} accent size="sm" />
        <div className="flex items-center grow gap-16">
          <div className="flex flex-col desktop:flex-row desktop:items-center grow desktop:gap-16">
            <div className="text-large ellipsis">{sender}</div>
            {message.sent ? (
              <div className="text-small text-secondary">
                <span className="sr-only">Skickat </span>
                {`${dayjs(message.sent).format('YYYY-MM-DD, HH:mm')}`}
              </div>
            ) : null}
          </div>
          {/* TODO: Uncomment when the API supports it
          {message.direction === 'OUTBOUND' && !messageIsViewed(message) ? (
            <div className="flex justify-end grow">
              <Label rounded color="vattjom" inverted>
                Nytt
              </Label>
            </div>
          ) : null} */}
        </div>
      </div>
      <div className="flex flex-col gap-y-24">
        <span
          className="text"
          dangerouslySetInnerHTML={{
            __html: sanitized(message.message?.replace(/\r\n/g, '<br>') || '')
              // Normalize both <br> and <br/>
              .replace(/<br\s*\/?>/gi, '<br/>')
              // Remove all <br/>s before the first non-<br/> tag/content
              .replace(/^(<br\/>\s*)+/i, '')
              // Remove all <br/>s after the last non-<br/> tag/content
              .replace(/(<br\/>\s*)+$/i, ''),
          }}
        />
        <CaseMessageFiles message={message} />
      </div>
    </div>
  );
}
