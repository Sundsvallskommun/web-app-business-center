import { FrontendMessageResponse } from '@interfaces/case';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import sanitized from '@services/sanitizer-service';
import { AvatarProps, Button, cx, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import localeSv from 'dayjs/locale/sv';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CornerUpLeft, Reply, UserRound } from 'lucide-react';
import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageAvatar } from './case-message-avatar.component';
import CaseMessageFiles from './case-message-files.component';
import { SkSymbol } from './sk-symbol';
import { messagePreview, senderLabel } from './utils';

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

export default function CaseMessage(props: {
  message: FrontendMessageResponse;
  isLatest?: boolean;
  // Whether this case's system supports replying (hides the "Svara" action when not).
  canReply?: boolean;
  // The message this one replies to, resolved by the parent; absent when not a reply (or unavailable).
  repliedMessage?: FrontendMessageResponse;
  isHighlighted?: boolean;
  onReply?: (message: FrontendMessageResponse) => void;
  onJumpTo?: (messageId: string) => void;
}) {
  const { t } = useTranslation('cases');
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const { message, isLatest, canReply, repliedMessage, isHighlighted, onReply, onJumpTo } = props;

  // Citizen's own messages (INBOUND) are "mine" → right/blue; handläggare (OUTBOUND) → left/neutral.
  // This mirrors drakel's handläggare view, where the perspective is reversed.
  const mine = message.direction === 'INBOUND';
  const sender = senderLabel(message, user?.name, t);

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
              <span className="sr-only">{t('cases:messages.sentSr')}</span>
              {formatTimeLabel(message.sent)}
            </time>
          ) : null}
          {isLatest ? (
            <Label rounded inverted color="vattjom" className="text-small">
              {t('cases:messages.latest')}
            </Label>
          ) : null}
          {canReply ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Reply size={16} />}
              className="shrink-0"
              aria-label={t('cases:messages.replyAria', { sender })}
              onClick={() => onReply?.(message)}
            >
              {t('cases:messages.reply')}
            </Button>
          ) : null}
        </div>

        {/* Mine (citizen) = blue bubble right; handläggare = neutral bubble left. */}
        <div
          className={cx(
            'flex flex-col gap-y-14 rounded-16 border-1 px-16 py-14 max-w-full shadow-sm',
            mine
              ? 'border-vattjom-background-300 bg-vattjom-surface-accent text-vattjom-text-primary'
              : 'border-divider bg-background-content text-body',
            isHighlighted && 'ring-2 ring-warning-surface-primary'
          )}
        >
          {message.inReplyToId ? (
            repliedMessage ? (
              <button
                type="button"
                className={cx(
                  'group flex w-full min-w-0 items-stretch overflow-hidden rounded-12 border-1 text-left shadow-sm transition hover:shadow-md',
                  mine
                    ? 'border-vattjom-background-300 bg-background-content text-body hover:bg-background-100'
                    : 'border-divider bg-background-200 text-body hover:bg-background-100'
                )}
                aria-label={t('cases:messages.jumpToQuoted')}
                onClick={() => {
                  if (repliedMessage.messageId) {
                    onJumpTo?.(repliedMessage.messageId);
                  }
                }}
              >
                <span className="w-6 shrink-0 bg-vattjom-surface-primary" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-y-4 px-12 py-10">
                  <span className="flex items-center gap-6 text-small font-bold text-body">
                    <CornerUpLeft size={16} className="shrink-0 text-vattjom-surface-primary" />
                    <span>
                      {t('cases:messages.replyingTo', { sender: senderLabel(repliedMessage, user?.name, t) })}
                    </span>
                  </span>
                  <span className="text-small line-clamp-2 break-words text-secondary">
                    {messagePreview(repliedMessage, t)}
                  </span>
                </span>
              </button>
            ) : (
              <div
                className={cx(
                  'flex items-center gap-8 rounded-12 border-1 border-l-4 px-12 py-10 text-small shadow-sm',
                  mine
                    ? 'border-vattjom-background-300 border-l-vattjom-surface-primary bg-background-content text-secondary'
                    : 'border-divider border-l-vattjom-surface-primary bg-background-200 text-secondary'
                )}
              >
                <CornerUpLeft size={16} className="shrink-0 text-vattjom-surface-primary" />
                {t('cases:messages.replyToEarlier')}
              </div>
            )
          ) : null}

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
