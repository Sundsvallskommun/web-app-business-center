// TODO: Remove and import these from data-contracts/webmessagecollector when published
export type MessageDTO = {
  id: number;
  direction: 'INBOUND' | 'OUTBOUND';
  municipalityId: string;
  familyId: string;
  externalCaseId: string;
  message: string;
  messageId: string;
  sent: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  attachments: MessageAttachment[];
  instance: string;
};

type MessageAttachment = {
  attachmentId: number;
  name: string;
  extension: string;
  mimeType: string;
};
