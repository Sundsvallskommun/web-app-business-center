import { AttachmentChannelEnum } from '@/data-contracts/case-data/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { AttachmentCategory, CaseDataNamespace } from '@/interfaces/casedata.interface';
import {
  buildAttachmentFormData,
  getDecisionAttachmentAsBase64,
  toAttachmentMetadata,
  uploadErrandAttachment,
} from '@/services/casedata-attachment.service';
import { mockUser } from './helpers/fixtures';
import { createMockApiService } from './helpers/mockApiService';

const mockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    originalname: 'lakarintyg.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('file content'),
    ...overrides,
  } as Express.Multer.File);

const attachmentOptions = { category: AttachmentCategory.MEDICAL_CONFIRMATION, note: 'Läkarintyg' };

describe('casedata-attachment.service', () => {
  describe('toAttachmentMetadata', () => {
    it('derives extension from the file name and marks the channel as my pages', () => {
      const metadata = toAttachmentMetadata(mockFile(), attachmentOptions);

      expect(metadata).toEqual({
        category: AttachmentCategory.MEDICAL_CONFIRMATION,
        name: 'lakarintyg.pdf',
        extension: 'pdf',
        mimeType: 'application/pdf',
        note: 'Läkarintyg',
        channel: AttachmentChannelEnum.MY_PAGES,
      });
    });

    it('leaves the extension empty when the file name has none', () => {
      const metadata = toAttachmentMetadata(mockFile({ originalname: 'intyg' }), attachmentOptions);

      expect(metadata.extension).toBe('');
    });

    it('never includes file content, which CaseData no longer accepts as metadata', () => {
      const metadata = toAttachmentMetadata(mockFile(), attachmentOptions);

      expect(metadata).not.toHaveProperty('file');
    });
  });

  describe('buildAttachmentFormData', () => {
    it('sends the binary as a file part and the metadata as a JSON part', async () => {
      const file = mockFile();
      const metadata = toAttachmentMetadata(file, attachmentOptions);

      const formData = buildAttachmentFormData(file, metadata);

      expect(formData.getAll('file')).toHaveLength(1);
      expect(formData.getAll('attachment')).toHaveLength(1);
      expect(JSON.parse(formData.get('attachment') as string)).toEqual(metadata);

      const filePart = formData.get('file') as File;
      expect(filePart.name).toBe('lakarintyg.pdf');
      expect(filePart.type).toBe('application/pdf');
      expect(await filePart.text()).toBe('file content');
    });
  });

  describe('uploadErrandAttachment', () => {
    it('posts multipart to the errand attachment endpoint', async () => {
      const api = createMockApiService();
      api.post.mockResolvedValue({ data: undefined });
      const file = mockFile();

      await uploadErrandAttachment(CaseDataNamespace.SBK_PARKING_PERMIT, 123, file, toAttachmentMetadata(file, attachmentOptions), mockUser, api);

      expect(api.post).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(`${CaseDataNamespace.SBK_PARKING_PERMIT}/errands/123/attachments`),
          headers: { 'Content-Type': 'multipart/form-data' },
          data: expect.any(FormData),
        }),
        mockUser,
      );
    });
  });

  describe('getDecisionAttachmentAsBase64', () => {
    it('requests the decision attachment sub-resource as binary and base64 encodes it', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: Buffer.from('decision pdf') });

      const result = await getDecisionAttachmentAsBase64(CaseDataNamespace.SBK_PARKING_PERMIT, 1, 2, 3, mockUser, api);

      expect(result).toBe(Buffer.from('decision pdf').toString('base64'));
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('errands/1/decisions/2/attachments/3'),
          responseType: 'arraybuffer',
        }),
        mockUser,
      );
    });

    it('returns null when the attachment is missing', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new HttpException(404, 'Not found'));

      await expect(getDecisionAttachmentAsBase64(CaseDataNamespace.SBK_PARKING_PERMIT, 1, 2, 3, mockUser, api)).resolves.toBeNull();
    });

    it('rethrows errors other than 404', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new HttpException(500, 'Internal server error'));

      await expect(getDecisionAttachmentAsBase64(CaseDataNamespace.SBK_PARKING_PERMIT, 1, 2, 3, mockUser, api)).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
