import { MessageResponseDirectionEnum } from '@data-contracts/case-data/data-contracts';
import { FrontendMessageResponse } from '@interfaces/case';
import { ApiResponse } from '@services/api-service';

export const getCaseMessages: () => ApiResponse<FrontendMessageResponse[]> = () => ({
  data: [
    {
      messageId: '11111111-1111-1111-1111-111111111111',
      direction: MessageResponseDirectionEnum.INBOUND,
      message: 'This is a short test message.',
      sent: '2023-01-01 10:00:00',
      sender: 'John Doe',
      attachments: [],
    },
    {
      messageId: '22222222-2222-2222-2222-222222222222',
      direction: MessageResponseDirectionEnum.OUTBOUND,
      message: 'This is a longer test message to simulate a different scenario.',
      sent: '2024-05-15 14:30:00',
      sender: 'Jane Smith',
      attachments: [
        { attachmentId: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', name: 'file1.pdf', contentType: 'application/pdf' },
      ],
    },
    {
      messageId: '33333333-3333-3333-3333-333333333333',
      direction: MessageResponseDirectionEnum.INBOUND,
      message: 'Another test message with multiple attachments.',
      sent: '2025-12-25 08:45:00',
      sender: 'Alice Johnson',
      attachments: [
        { attachmentId: 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', name: 'image1.png', contentType: 'image/png' },
        { attachmentId: 'cccc3333-cccc-3333-cccc-3333cccc3333', name: 'image2.jpg', contentType: 'image/jpeg' },
      ],
    },
    {
      messageId: '44444444-4444-4444-4444-444444444444',
      direction: MessageResponseDirectionEnum.OUTBOUND,
      message: 'Short message with no attachments.',
      sent: '2022-07-20 16:00:00',
      sender: 'Bob Brown',
      attachments: [],
    },
    {
      messageId: '55555555-5555-5555-5555-555555555555',
      direction: MessageResponseDirectionEnum.INBOUND,
      message: 'Test message with a very long content to simulate edge cases in message length. '.repeat(10),
      sent: '2021-03-10 09:15:00',
      sender: 'Charlie Davis',
      attachments: [
        {
          attachmentId: 'dddd4444-dddd-4444-dddd-4444dddd4444',
          name: 'document.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    },
    {
      messageId: '66666666-6666-6666-6666-666666666666',
      direction: MessageResponseDirectionEnum.OUTBOUND,
      message: 'Test message with no recipients and no attachments.',
      sent: '2020-11-11 11:11:11',
      sender: 'Diana Evans',
      attachments: [],
    },
  ],
  message: 'success',
});
