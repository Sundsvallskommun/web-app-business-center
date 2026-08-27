import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Attachment, AttachmentChannelEnum } from '@/data-contracts/case-data/data-contracts';
import { AttachmentCategory } from '@/interfaces/casedata.interface';
import { User } from '@/interfaces/users.interface';
import { apiURL } from '@/utils/util';
import ApiService from './api.service';

const defaultApi = new ApiService();

// The only fields CaseData still accepts as attachment metadata. The base64 `file`
// field is gone from the contract - file content travels as its own binary part.
type AttachmentMetadata = Pick<Attachment, 'category' | 'name' | 'extension' | 'mimeType' | 'note' | 'channel'>;

const fileExtension = (originalname: string): string => {
  const lastDot = originalname.lastIndexOf('.');
  return lastDot > 0 ? originalname.slice(lastDot + 1) : '';
};

export const toAttachmentMetadata = (file: Express.Multer.File, options: { category: AttachmentCategory; note: string }): AttachmentMetadata => ({
  category: options.category,
  name: file.originalname,
  extension: fileExtension(file.originalname),
  mimeType: file.mimetype,
  note: options.note,
  channel: AttachmentChannelEnum.MY_PAGES,
});

// CaseData expects exactly two parts: the binary `file` (with filename) and an
// `attachment` part holding the metadata as a JSON string.
export const buildAttachmentFormData = (file: Express.Multer.File, metadata: AttachmentMetadata): FormData => {
  const formData = new FormData();
  formData.append('file', new Blob([file.buffer as BlobPart], { type: file.mimetype }), file.originalname);
  formData.append('attachment', JSON.stringify(metadata));
  return formData;
};

export const uploadErrandAttachment = async (
  namespace: string,
  errandId: number,
  file: Express.Multer.File,
  metadata: AttachmentMetadata,
  user: User,
  api: Pick<ApiService, 'post'> = defaultApi,
): Promise<void> => {
  const baseURL = apiURL(getApiBase('case-data'));
  const url = `${MUNICIPALITY_ID}/${namespace}/errands/${errandId}/attachments`;

  await api.post<void, FormData>(
    { url, baseURL, data: buildAttachmentFormData(file, metadata), headers: { 'Content-Type': 'multipart/form-data' } },
    user,
  );
};

// Decision attachments are their own sub-resource and can no longer be read off the
// decision payload. Returns null on 404 so callers can map a missing file to their
// own status instead of surfacing a 500.
export const getDecisionAttachmentAsBase64 = async (
  namespace: string,
  errandId: number,
  decisionId: number,
  attachmentId: number,
  user: User,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<string | null> => {
  const baseURL = apiURL(getApiBase('case-data'));
  const url = `${MUNICIPALITY_ID}/${namespace}/errands/${errandId}/decisions/${decisionId}/attachments/${attachmentId}`;

  try {
    const res = await api.get<Buffer>({ url, baseURL, responseType: 'arraybuffer' }, user);
    return res.data ? Buffer.from(res.data).toString('base64') : null;
  } catch (error: any) {
    // routing-controllers' HttpError resets the prototype, so subclasses of it fail an
    // `instanceof HttpException` check - the rest of the codebase reads `status` instead.
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
};
