import { AttachmentResponse, Message, MessageResponseDirectionEnum, MessageTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { Errand, Message as CareManagementMessage } from '@/data-contracts/caremanagement/data-contracts';
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

// Synthetic system value for caremanagement errands. They are not produced by casestatus — this
// backend fetches them directly and maps them onto the CaseStatusResponse shape (see
// mapCareManagementErrandToCase) so they slot into the same case list / case page.
export const CARE_MANAGEMENT_SYSTEM = 'CARE_MANAGEMENT';

// A case is shown when its namespace is whitelisted, or — when it has no namespace at all — when
// its originating system is whitelisted, or when it is one of our own caremanagement errands.
export const caseIsAllowed = (c: CaseStatusResponse): boolean =>
  namespaceIsAllowed(c) || (typeof c.namespace === 'undefined' && systemIsAllowed(c)) || c.system === CARE_MANAGEMENT_SYSTEM;

// caremanagement financial-assistance statuses → the Swedish externalStatus labels the frontend
// status map understands (see mapStatus in frontend case-service.ts). Unknown statuses fall back
// to "Handläggning pågår" so the case still lands in the ongoing bucket with a sane colour.
const CARE_MANAGEMENT_STATUS_LABELS: Readonly<Record<string, string>> = {
  NEW: 'Inskickat',
  INKOMMEN: 'Inskickat',
  ONGOING: 'Handläggning pågår',
  DECIDED: 'Avslutat',
};

/** Maps a caremanagement Errand onto the CaseStatusResponse shape the case list/page consume. */
export const mapCareManagementErrandToCase = (errand: Errand): CaseStatusResponse => ({
  caseId: errand.id,
  caseType: errand.typeSlug,
  status: errand.status,
  externalStatus: CARE_MANAGEMENT_STATUS_LABELS[errand.status ?? ''] ?? 'Handläggning pågår',
  firstSubmitted: errand.created,
  lastStatusChange: errand.modified ?? errand.created,
  system: CARE_MANAGEMENT_SYSTEM,
  namespace: errand.namespace,
  errandNumber: errand.errandNumber,
});

/** Maps a caremanagement conversation Message onto the frontend message shape. */
export const mapCareManagementMessage = (msg: CareManagementMessage, senderName: string): FrontendMessageResponse => ({
  conversationId: '',
  messageId: msg.id ?? '',
  direction: msg.direction === 'OUTBOUND' ? MessageResponseDirectionEnum.OUTBOUND : MessageResponseDirectionEnum.INBOUND,
  message: msg.body ?? '',
  sent: msg.created ?? '',
  sender: senderName,
  inReplyToId: msg.inReplyToId,
  attachments: (msg.attachments ?? []).map(attachment => ({
    attachmentId: attachment.id ?? '',
    name: attachment.fileName ?? '',
    contentType: attachment.mimeType,
  })),
});

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
    inReplyToId: msg.inReplyToMessageId,
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
