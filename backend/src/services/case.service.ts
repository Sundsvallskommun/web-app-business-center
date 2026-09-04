import { AttachmentResponse, Message, MessageResponseDirectionEnum, MessageTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { WebMessageRequest as MessagingWebMessageRequest, WebMessageRequestOepInstanceEnum } from '@/data-contracts/messaging/data-contracts';
import { MessageDTO } from '@/data-contracts/webmessagecollector/data-contracts';
import { FrontendMessageResponse, MessageWithConversationId } from '@/interfaces/case.interface';
import { CaseDataNamespace } from '@/interfaces/casedata.interface';
import { User } from '@/interfaces/users.interface';
import dayjs from 'dayjs';

// --- Case visibility ---------------------------------------------------------

const allowedNamespaces: ReadonlySet<string> = new Set([
  CaseDataNamespace.SBK_MEX,
  CaseDataNamespace.SBK_PARKING_PERMIT,
  CaseDataNamespace.CONTACTSUNDSVALL,
]);
const namespaceIsAllowed = (c: CaseStatusResponse): boolean => !!c?.namespace && allowedNamespaces.has(c.namespace);

const allowedSystems: ReadonlySet<string> = new Set(['OPEN_E_PLATFORM', 'BYGGR']);
const systemIsAllowed = (c: CaseStatusResponse): boolean => !!c?.system && allowedSystems.has(c.system);

// A case is shown when its namespace is whitelisted, or — when it has no
// namespace at all — when its originating system is whitelisted.
// Drafts are currently only allowed if they are from OPEN_E_PLATFORM
const draftStatuses: ReadonlySet<string> = new Set(['Sparat', 'Väntar på flerpartssignering']);
const isDraft = (c: CaseStatusResponse): boolean => !!c.externalStatus && draftStatuses.has(c.externalStatus);
export const caseIsAllowed = (c: CaseStatusResponse): boolean =>
  (namespaceIsAllowed(c) || (typeof c.namespace === 'undefined' && systemIsAllowed(c))) && (!isDraft(c) || c.system === 'OPEN_E_PLATFORM');

// --- Conversation / message payload builders ---------------------------------

// The body used to open a new EXTERNAL conversation for the logged in user.
export const conversationInit = (user: User) => ({
  topic: 'Mina Sidor',
  type: 'EXTERNAL',
  participants: [
    {
      type: 'partyId',
      value: user.partyId,
    },
  ],
});

// Body of the Messaging API web-message call used for OpenE cases.
export const buildMessagingWebMessageRequest = (
  partyId: string,
  caseId: string,
  message: string,
  files: Express.Multer.File[],
): MessagingWebMessageRequest => ({
  sendAsOwner: true,
  party: {
    partyId,
    externalReferences: [
      {
        key: 'flowInstanceId',
        value: caseId,
      },
    ],
  },
  oepInstance: WebMessageRequestOepInstanceEnum.EXTERNAL,
  message,
  attachments: files.length
    ? files?.map(x => ({ base64Data: x.buffer.toString('base64'), fileName: x.originalname, mimeType: x.mimetype }))
    : undefined,
});

// --- Message normalization ---------------------------------------------------
// The standard identifier types are camelCase; the uppercase variants are kept
// as an exception for sources that still emit them.
const citizenCreatedKeys = ['partyId', 'PARTY_ID'];
const adUserCreatedKeys = ['adAccount', 'AD_ACCOUNT'];

// From a batch of conversation messages, the distinct sender identifiers that
// need a name lookup, split by identifier type (AD users vs. citizens).
export const collectSenderIdentifiers = (messages: MessageWithConversationId<Message>[]): { adUsernames: string[]; citizenPartyIds: string[] } => ({
  adUsernames: Array.from(
    new Set(
      messages.filter(msg => adUserCreatedKeys.includes(msg.createdBy?.type ?? '') && msg?.createdBy?.value).map(msg => msg.createdBy?.value ?? ''),
    ),
  ),
  citizenPartyIds: Array.from(
    new Set(
      messages.filter(msg => citizenCreatedKeys.includes(msg.createdBy?.type ?? '') && msg?.createdBy?.value).map(msg => msg.createdBy?.value ?? ''),
    ),
  ),
});

// Maps a case-data/support-management conversation message to the frontend
// shape, resolving the sender name from a pre-fetched identifier -> name map.
export const toFrontendMessage = (msg: MessageWithConversationId<Message>, nameMap: Record<string, string>, user: User): FrontendMessageResponse => {
  let sender = '';
  if (citizenCreatedKeys.includes(msg?.createdBy?.type ?? '') && msg?.createdBy?.value === user.partyId) {
    sender = user.name;
  } else {
    sender = (msg.createdBy?.value && nameMap[msg.createdBy?.value]) ?? 'Okänd avsändare';
  }
  return {
    conversationId: msg.conversationId,
    messageId: msg.id,
    message: msg.content,
    sent: msg.created,
    sender,
    direction: citizenCreatedKeys.includes(msg?.createdBy?.type ?? '') ? 'INBOUND' : 'OUTBOUND',
    attachments: msg.attachments?.map(attachment => ({
      attachmentId: attachment.id?.toString() ?? '',
      name: attachment.fileName,
      contentType: attachment.mimeType,
    })),
  } as FrontendMessageResponse;
};

// Maps webmessagecollector (OpenE/BYGGR/ECOS) messages to the frontend shape.
export const normalizeWebMessageCollectorMessages = (messages: MessageDTO[]): FrontendMessageResponse[] =>
  messages.map(message => ({
    // FIXME: Finns conversationId i webmessagecollector?
    conversationId: '',
    messageId: message.messageId ?? '',
    direction: message.direction === 'OUTBOUND' ? MessageResponseDirectionEnum.OUTBOUND : MessageResponseDirectionEnum.INBOUND,
    message: message.message ?? '',
    sent: message.sent ?? '',
    sender: `${message.firstName ?? ''} ${message.lastName ?? ''}`,
    attachments:
      message.attachments
        ?.filter(a => a && a.attachmentId != null && a.name)
        .map(
          attachment =>
            ({
              attachmentId: `${attachment.attachmentId}`,
              name: attachment.name,
              contentType: attachment.mimeType,
            } as AttachmentResponse),
        ) || [],
  }));

// Of the freshly fetched messages, the user-created ones not already seen,
// tagged with the conversation they belong to.
export const filterNewUserMessages = (
  seenMessages: MessageWithConversationId<Message>[],
  responseMessages: Message[],
  conversationId: string,
): MessageWithConversationId<Message>[] => {
  const seenIds = seenMessages.map(m => m.id);
  return responseMessages
    .filter(msg => !seenIds.includes(msg.id) && msg.type === MessageTypeEnum.USER_CREATED)
    .map(msg => ({ ...msg, conversationId }));
};

// Newest message first; entries without a `sent` timestamp sort last.
export const sortMessagesBySentDesc = (messages: FrontendMessageResponse[]): FrontendMessageResponse[] =>
  [...messages].sort((a, b) => {
    if (!a.sent && !b.sent) return 0;
    if (!a.sent) return 1;
    if (!b.sent) return -1;
    return dayjs(b.sent).isBefore(dayjs(a.sent)) ? -1 : 1;
  });
