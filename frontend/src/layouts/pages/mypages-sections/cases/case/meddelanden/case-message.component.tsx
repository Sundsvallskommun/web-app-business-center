import { FrontendMessageResponse } from '@interfaces/case';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import sanitized from '@services/sanitizer-service';
import { AvatarProps, cx, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import localeSv from 'dayjs/locale/sv';
import relativeTime from 'dayjs/plugin/relativeTime';
import { UserRound } from 'lucide-react';
import { JSX } from 'react';
import { MessageAvatar } from './case-message-avatar.component';
import CaseMessageFiles from './case-message-files.component';
import { SkSymbol } from './sk-symbol';

dayjs.extend(relativeTime);
// Register the locale as a VALUE — a bare `import 'dayjs/locale/sv'` can be tree-shaken,
// which leaves fromNow() in English.
dayjs.locale(localeSv);

const formatAbsolute = (sent: string): string => dayjs(sent).format('YYYY-MM-DD, HH:mm');

// Relative ("2 timmar sedan") while recent, absolute date once it is older than a week.
const formatTimeLabel = (sent: string): string => {
  const then = dayjs(sent);
  return dayjs().diff(then, 'day') < 7 ? then.fromNow() : then.format('YYYY-MM-DD, HH:mm');
};

export default function CaseMessage(props: { message: FrontendMessageResponse; isLatest?: boolean }) {
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const { message, isLatest } = props;

  // Citizen's own messages (INBOUND) are "mine" → right/blue; handläggare (OUTBOUND) → left/neutral.
  // This mirrors drakel's handläggare view, where the perspective is reversed.
  const mine = message.direction === 'INBOUND';

  const sender =
    message.direction === 'OUTBOUND'
      ? `${message.sender} (Handläggare)`
      : user?.name === message.sender
        ? 'Jag'
        : message.sender;

  const avatarSettings: { color: AvatarProps['color']; logo: JSX.Element } =
    message.direction === 'OUTBOUND'
      ? {
          color: 'bjornstigen',
          logo: <SkSymbol />,
        }
      : { color: 'gronsta', logo: <UserRound size={21} /> };

  return (
    <article className={cx('case-message flex items-start gap-12 py-12 px-8', mine && 'flex-row-reverse')}>
      <div className="shrink-0">
        <MessageAvatar color={avatarSettings.color} logo={avatarSettings.logo} />
      </div>
      <div className={cx('flex flex-col gap-y-4 min-w-0 max-w-[min(52rem,80%)]', mine ? 'items-end' : 'items-start')}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 max-w-full px-2">
          <span className="font-bold text-body text-small truncate">{sender}</span>
          {message.sent ? (
            <time dateTime={message.sent} title={formatAbsolute(message.sent)} className="text-small text-secondary">
              <span className="sr-only">Skickat </span>
              {formatTimeLabel(message.sent)}
            </time>
          ) : null}
          {isLatest ? (
            <Label rounded inverted color="vattjom" className="text-small">
              Senaste
            </Label>
          ) : null}
        </div>

        {/* Mine (citizen) = blue bubble right; handläggare = neutral bubble left. */}
        <div
          className={cx(
            'flex flex-col gap-y-14 rounded-16 border-1 px-16 py-14 max-w-full shadow-sm',
            mine
              ? 'border-vattjom-surface-primary bg-vattjom-surface-primary text-white dark:border-vattjom-background-300 dark:bg-vattjom-background-200 dark:text-vattjom-text-primary'
              : 'border-divider bg-background-content text-body dark:bg-background-200'
          )}
        >
          <span
            className="text whitespace-pre-wrap break-words"
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
          <CaseMessageFiles message={message} mine={mine} />
        </div>
      </div>
    </article>
  );
}
