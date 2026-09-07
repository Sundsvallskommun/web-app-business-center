import { Message, MessageResponseDirectionEnum, MessageTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { MessageDTO, MessageDtoDirectionEnum } from '@/data-contracts/webmessagecollector/data-contracts';
import { FrontendMessageResponse, MessageWithConversationId } from '@/interfaces/case.interface';
import { CaseDataNamespace } from '@/interfaces/casedata.interface';
import { User } from '@/interfaces/users.interface';
import {
  buildMessagingWebMessageRequest,
  caseIsAllowed,
  collectSenderIdentifiers,
  conversationInit,
  filterNewUserMessages,
  normalizeWebMessageCollectorMessages,
  sortMessagesBySentDesc,
  toFrontendMessage,
} from '@/services/case.service';
import { mockUser as sharedUser } from './helpers/fixtures';
import { TEST_OTHER_PARTY_ID, TEST_USER_PARTY_ID } from './helpers/constants';

// Derive from the shared fixture; only the display name differs. The logged-in user's
// partyId is TEST_USER_PARTY_ID (from the fixture), and the message-sender assertions
// below reference that same constant for the "own message" cases.
const mockUser: User = { ...sharedUser, name: 'Test Testsson' };

const convMessage = (overrides: Partial<MessageWithConversationId<Message>> = {}): MessageWithConversationId<Message> =>
  ({
    id: 'm1',
    content: 'hello',
    created: '2025-01-01T00:00:00Z',
    conversationId: 'c1',
    type: MessageTypeEnum.USER_CREATED,
    createdBy: { type: 'partyId', value: TEST_OTHER_PARTY_ID },
    ...overrides,
  } as MessageWithConversationId<Message>);

describe('case.service', () => {
  describe('caseIsAllowed', () => {
    it('allows cases with a whitelisted namespace', () => {
      expect(caseIsAllowed({ namespace: CaseDataNamespace.SBK_MEX } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ namespace: CaseDataNamespace.SBK_PARKING_PERMIT } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ namespace: CaseDataNamespace.CONTACTSUNDSVALL } as CaseStatusResponse)).toBe(true);
    });

    it('rejects cases with a non-whitelisted namespace, regardless of system', () => {
      expect(caseIsAllowed({ namespace: 'OTHER', system: 'OPEN_E_PLATFORM' } as CaseStatusResponse)).toBe(false);
    });

    it('falls back to the system whitelist only when namespace is undefined', () => {
      expect(caseIsAllowed({ system: 'OPEN_E_PLATFORM' } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ system: 'BYGGR' } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ system: 'ECOS' } as CaseStatusResponse)).toBe(false);
      expect(caseIsAllowed({ system: 'CASE_DATA' } as CaseStatusResponse)).toBe(false);
    });

    it('allows drafts only from OPEN_E_PLATFORM', () => {
      expect(caseIsAllowed({ system: 'OPEN_E_PLATFORM', externalStatus: 'Sparat' } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ system: 'OPEN_E_PLATFORM', externalStatus: 'Väntar på flerpartssignering' } as CaseStatusResponse)).toBe(true);
      expect(caseIsAllowed({ system: 'BYGGR', externalStatus: 'Sparat' } as CaseStatusResponse)).toBe(false);
      expect(caseIsAllowed({ namespace: CaseDataNamespace.SBK_MEX, system: 'CASE_DATA', externalStatus: 'Sparat' } as CaseStatusResponse)).toBe(
        false,
      );
    });
  });

  describe('conversationInit', () => {
    it('builds an EXTERNAL conversation with the user as participant', () => {
      expect(conversationInit(mockUser)).toEqual({
        topic: 'Mina Sidor',
        type: 'EXTERNAL',
        participants: [{ type: 'partyId', value: TEST_USER_PARTY_ID }],
      });
    });
  });

  describe('buildMessagingWebMessageRequest', () => {
    const file = (name: string) => ({ buffer: Buffer.from(name), originalname: name, mimetype: 'text/plain' } as Express.Multer.File);

    it('references the case as a flowInstanceId external reference', () => {
      const result = buildMessagingWebMessageRequest(TEST_USER_PARTY_ID, 'case-1', 'hi', []);
      expect(result).toMatchObject({
        sendAsOwner: true,
        party: { partyId: TEST_USER_PARTY_ID, externalReferences: [{ key: 'flowInstanceId', value: 'case-1' }] },
        oepInstance: 'EXTERNAL',
        message: 'hi',
      });
    });

    it('omits attachments when there are no files', () => {
      expect(buildMessagingWebMessageRequest(TEST_USER_PARTY_ID, 'case-1', 'hi', []).attachments).toBeUndefined();
    });

    it('base64-encodes file buffers as attachments', () => {
      const result = buildMessagingWebMessageRequest(TEST_USER_PARTY_ID, 'case-1', 'hi', [file('a.txt')]);
      expect(result.attachments).toEqual([{ base64Data: Buffer.from('a.txt').toString('base64'), fileName: 'a.txt', mimeType: 'text/plain' }]);
    });
  });

  describe('collectSenderIdentifiers', () => {
    it('splits distinct senders by identifier type and ignores empty/other values', () => {
      const messages = [
        convMessage({ createdBy: { type: 'adAccount', value: 'ad1' } }),
        convMessage({ createdBy: { type: 'adAccount', value: 'ad1' } }), // duplicate
        convMessage({ createdBy: { type: 'partyId', value: 'p1' } }),
        convMessage({ createdBy: { type: 'partyId', value: '' } }), // empty value
        convMessage({ createdBy: undefined }), // no createdBy
      ];

      expect(collectSenderIdentifiers(messages)).toEqual({
        adUsernames: ['ad1'],
        citizenPartyIds: ['p1'],
      });
    });

    it('buckets the uppercase identifier types the same as the camelCase ones', () => {
      const messages = [
        convMessage({ createdBy: { type: 'AD_ACCOUNT', value: 'ad1' } }),
        convMessage({ createdBy: { type: 'PARTY_ID', value: 'p1' } }),
      ];

      expect(collectSenderIdentifiers(messages)).toEqual({
        adUsernames: ['ad1'],
        citizenPartyIds: ['p1'],
      });
    });
  });

  describe('toFrontendMessage', () => {
    it("uses the logged in user's own name when they are the sender", () => {
      const msg = convMessage({ createdBy: { type: 'partyId', value: TEST_USER_PARTY_ID } });
      expect(toFrontendMessage(msg, {}, mockUser).sender).toBe('Test Testsson');
    });

    it('resolves other senders from the name map', () => {
      const msg = convMessage({ createdBy: { type: 'partyId', value: TEST_OTHER_PARTY_ID } });
      expect(toFrontendMessage(msg, { [TEST_OTHER_PARTY_ID]: 'Other Person' }, mockUser).sender).toBe('Other Person');
    });

    it('falls back to "Okänd avsändare" when the sender is unknown', () => {
      const msg = convMessage({ createdBy: { type: 'adAccount', value: 'missing' } });
      expect(toFrontendMessage(msg, {}, mockUser).sender).toBe('Okänd avsändare');
    });

    it('marks partyId senders as INBOUND and others as OUTBOUND', () => {
      expect(toFrontendMessage(convMessage({ createdBy: { type: 'partyId', value: 'x' } }), {}, mockUser).direction).toBe('INBOUND');
      expect(toFrontendMessage(convMessage({ createdBy: { type: 'adAccount', value: 'x' } }), {}, mockUser).direction).toBe('OUTBOUND');
    });

    it('also handles the uppercase PARTY_ID/AD_ACCOUNT variants', () => {
      expect(toFrontendMessage(convMessage({ createdBy: { type: 'PARTY_ID', value: 'x' } }), {}, mockUser).direction).toBe('INBOUND');
      expect(toFrontendMessage(convMessage({ createdBy: { type: 'AD_ACCOUNT', value: 'x' } }), {}, mockUser).direction).toBe('OUTBOUND');
      // own message via uppercase PARTY_ID resolves to the logged in user's name
      expect(toFrontendMessage(convMessage({ createdBy: { type: 'PARTY_ID', value: TEST_USER_PARTY_ID } }), {}, mockUser).sender).toBe(
        'Test Testsson',
      );
    });

    it('maps message fields and attachments to the frontend shape', () => {
      const msg = convMessage({
        id: 'mid',
        content: 'body',
        created: '2025-02-02T10:00:00Z',
        conversationId: 'conv-9',
        attachments: [{ id: '42', fileName: 'doc.pdf', mimeType: 'application/pdf' }],
      });

      expect(toFrontendMessage(msg, {}, mockUser)).toMatchObject({
        conversationId: 'conv-9',
        messageId: 'mid',
        message: 'body',
        sent: '2025-02-02T10:00:00Z',
        attachments: [{ attachmentId: '42', name: 'doc.pdf', contentType: 'application/pdf' }],
      });
    });
  });

  describe('normalizeWebMessageCollectorMessages', () => {
    const dto = (overrides: Partial<MessageDTO> = {}): MessageDTO =>
      ({
        messageId: 'w1',
        direction: MessageDtoDirectionEnum.INBOUND,
        message: 'text',
        sent: '2025-03-03T00:00:00Z',
        firstName: 'Anna',
        lastName: 'Andersson',
        attachments: [],
        ...overrides,
      } as MessageDTO);

    it('maps OUTBOUND/INBOUND direction and composes the sender name', () => {
      expect(normalizeWebMessageCollectorMessages([dto({ direction: MessageDtoDirectionEnum.OUTBOUND })])[0]).toMatchObject({
        conversationId: '',
        messageId: 'w1',
        direction: MessageResponseDirectionEnum.OUTBOUND,
        sender: 'Anna Andersson',
      });
      expect(normalizeWebMessageCollectorMessages([dto({ direction: MessageDtoDirectionEnum.INBOUND })])[0].direction).toBe(
        MessageResponseDirectionEnum.INBOUND,
      );
    });

    it('stringifies attachment ids', () => {
      const result = normalizeWebMessageCollectorMessages([dto({ attachments: [{ attachmentId: 7, name: 'f.png', mimeType: 'image/png' }] })]);
      expect(result[0].attachments).toEqual([{ attachmentId: '7', name: 'f.png', contentType: 'image/png' }]);
    });

    it('keeps attachments without a mime type (contentType undefined) but drops those missing id or name', () => {
      const result = normalizeWebMessageCollectorMessages([
        dto({
          attachments: [
            { attachmentId: 1, name: 'no-mime.bin' }, // kept, contentType undefined
            { attachmentId: 0, name: 'zero-id.txt', mimeType: 'text/plain' }, // kept, id 0 is valid
            { name: 'no-id.txt', mimeType: 'text/plain' }, // dropped, missing id
            { attachmentId: 2, mimeType: 'text/plain' }, // dropped, missing name
            null as never, // dropped, null entry
          ],
        }),
      ]);
      expect(result[0].attachments).toEqual([
        { attachmentId: '1', name: 'no-mime.bin', contentType: undefined },
        { attachmentId: '0', name: 'zero-id.txt', contentType: 'text/plain' },
      ]);
    });
  });

  describe('filterNewUserMessages', () => {
    const msg = (id: string, type: MessageTypeEnum = MessageTypeEnum.USER_CREATED): Message => ({ id, content: 'c', type } as Message);

    it('keeps only user-created messages not already seen and tags them with the conversation id', () => {
      const seen = [convMessage({ id: 'a' })];
      const incoming = [msg('a'), msg('b'), msg('c', MessageTypeEnum.SYSTEM_CREATED)];

      const result = filterNewUserMessages(seen, incoming, 'conv-1');

      expect(result).toEqual([{ id: 'b', content: 'c', type: MessageTypeEnum.USER_CREATED, conversationId: 'conv-1' }]);
    });
  });

  describe('sortMessagesBySentDesc', () => {
    const m = (sent: string | undefined): FrontendMessageResponse => ({ sent } as FrontendMessageResponse);

    it('orders newest first', () => {
      const sorted = sortMessagesBySentDesc([m('2025-01-01'), m('2025-03-01'), m('2025-02-01')]);
      expect(sorted.map(x => x.sent)).toEqual(['2025-03-01', '2025-02-01', '2025-01-01']);
    });

    it('pushes messages without a sent timestamp to the end', () => {
      const sorted = sortMessagesBySentDesc([m(undefined), m('2025-01-01'), m(undefined)]);
      expect(sorted.map(x => x.sent)).toEqual(['2025-01-01', undefined, undefined]);
    });

    it('does not mutate the input array', () => {
      const input = [m('2025-01-01'), m('2025-03-01')];
      sortMessagesBySentDesc(input);
      expect(input.map(x => x.sent)).toEqual(['2025-01-01', '2025-03-01']);
    });
  });
});
