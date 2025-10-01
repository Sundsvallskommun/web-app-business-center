import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  Conversation,
  Message,
  MessageRequest,
  MessageResponseDirectionEnum,
  MessageTypeEnum,
  PageMessage,
} from '@/data-contracts/case-data/data-contracts';
import { CasePdfResponse, CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { WebMessageRequest as MessagingWebMessageRequest, WebMessageRequestOepInstanceEnum } from '@/data-contracts/messaging/data-contracts';
import { WebMessageRequest } from '@/data-contracts/supportmanagement/data-contracts';
import { MessageDTO } from '@/data-contracts/webmessagecollector/data-contracts';
import { CaseMessageDto } from '@/dtos/case-data.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { CaseMessage, FrontendMessageResponse, MessageWithConversationId } from '@/interfaces/case.interface';
import ApiService from '@/services/api.service';
import { getUserData } from '@/services/user.service';
import { filterExternalConversation, findExternalConversation } from '@/utils/conversation-utils';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { validateRequestBody } from '@/utils/validate';
import { User } from '@interfaces/users.interface';
import authMiddleware from '@middlewares/auth.middleware';
import dayjs from 'dayjs';
import { Body, Controller, Get, Param, Post, Put, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse } from '../interfaces/service';
import { formatOrgNr } from '../utils/util';

const USE_CASES_CACHE = false;

const allowedNamespaces: string[] = ['SBK_MEX', 'SBK_PARKING_PERMIT', 'CONTACTSUNDSVALL'];
const namespaceIsallowed = (c: CaseStatusResponse) => allowedNamespaces.includes(c.namespace);

const allowedSystems: string[] = ['OPEN_E_PLATFORM', 'BYGGR'];
const systemIsAllowed = (c: CaseStatusResponse) => allowedSystems.includes(c.system);

const caseIsallowed = (c: CaseStatusResponse) => namespaceIsallowed(c) || (typeof c.namespace === 'undefined' && systemIsAllowed(c));

@Controller()
export class CaseController {
  private apiService = new ApiService();
  private apiBase = getApiBase('casestatus');

  private setBusinesCasesCache(req: RequestWithUser, orgNumber: string, data: CaseStatusResponse[]) {
    if (!req.session.cache) {
      req.session.cache = {
        cases: {},
      };
    }

    if (!req.session.cache.cases.BUSINESS) {
      req.session.cache.cases.BUSINESS = {};
    }

    req.session.cache.cases.BUSINESS[orgNumber] = data;
  }

  private setPrivateCasesCache(req: RequestWithUser, data: CaseStatusResponse[]) {
    if (!req.session.cache) {
      req.session.cache = {
        cases: {},
      };
    }

    req.session.cache.cases.PRIVATE = data;
  }

  private setCasesCache(req: RequestWithUser, data: CaseStatusResponse[] | null) {
    if (req.session.representing.mode === RepresentingMode.BUSINESS) {
      this.setBusinesCasesCache(req, formatOrgNr(req.session.representing.BUSINESS.organizationNumber), data);
    } else {
      this.setPrivateCasesCache(req, data);
    }
  }

  private getCaseFromCache(req: RequestWithUser, caseId: string): CaseStatusResponse | null {
    let cases: CaseStatusResponse[] | null;
    if (req.session.representing.mode === RepresentingMode.BUSINESS) {
      cases = req.session.cache?.cases?.BUSINESS?.[formatOrgNr(req.session.representing.BUSINESS.organizationNumber)] ?? null;
    } else {
      cases = req.session.cache?.cases?.PRIVATE ?? null;
    }
    return cases?.find(c => c.caseId === caseId) ?? null;
  }

  private conversationInit(user: User) {
    return {
      topic: 'Mina Sidor',
      type: 'EXTERNAL',
      participants: [
        {
          type: 'partyId',
          value: user.partyId,
        },
      ],
    };
  }

  private async normalizeConversationMessages(messages: MessageWithConversationId<Message>[], user: User): Promise<FrontendMessageResponse[]> {
    const senderUsernames = Array.from(new Set(messages.filter(msg => msg.createdBy?.type === 'AD_ACCOUNT').map(msg => msg.createdBy.value)));

    const namePromises = senderUsernames.map(async username => {
      const userData = await getUserData(username, { user });
      return {
        username,
        name: `${userData.givenname} ${userData.lastname}`,
      };
    });

    return Promise.allSettled(namePromises).then(results => {
      const nameMap = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          acc[result.value.username] = result.value.name;
        }
        return acc;
      }, {});

      return messages.map((msg: Message & { conversationId: string }) => {
        return {
          conversationId: msg.conversationId,
          messageId: msg.id,
          message: msg.content,
          sent: msg.created,
          sender:
            msg?.createdBy?.value && msg?.createdBy?.value === user.partyId ? `${user.name}` : nameMap[msg.createdBy?.value] ?? 'Okänd avsändare',
          direction: msg?.createdBy?.value ? (msg?.createdBy?.value === user.partyId ? 'INBOUND' : 'OUTBOUND') : '',
          attachments: msg.attachments?.map(attachment => ({
            attachmentId: attachment.id.toString(),
            // FIXME: attachment.fileName is the correct field but the generated types are incorrect.
            // When the API is fixed, the type conversions to any should be removed.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: (attachment as any).fileName,
            contentType: attachment.mimeType,
          })),
        };
      }) as FrontendMessageResponse[];
    });
  }

  private normalizeWebMessageCollectorMessages(messages: MessageDTO[]): FrontendMessageResponse[] {
    return messages.map(message => ({
      // FIXME: Finns conversationId i webmessagecollector?
      conversationId: '',
      messageId: message.messageId,
      direction: message.direction === 'OUTBOUND' ? MessageResponseDirectionEnum.OUTBOUND : MessageResponseDirectionEnum.INBOUND,
      message: message.message,
      sent: message.sent,
      sender: `${message.firstName} ${message.lastName}`,
      attachments: message.attachments.map(attachment => ({
        attachmentId: `${attachment.attachmentId}`,
        name: attachment.name,
        contentType: attachment.mimeType,
      })),
    }));
  }

  private postMessageToMessagingMessage(
    req: RequestWithUser,
    caseId: string,
    message: string,
    files: Express.Multer.File[],
  ): MessagingWebMessageRequest {
    return {
      sendAsOwner: true,
      party: {
        partyId: req.user.partyId,
        externalReferences: [
          {
            key: 'flowInstanceId',
            value: caseId,
          },
        ],
      },
      oepInstance: WebMessageRequestOepInstanceEnum.EXTERNAL,
      message: message,
      attachments: files.length
        ? files?.map(x => ({ base64Data: x.buffer.toString('base64'), fileName: x.originalname, mimeType: x.mimetype }))
        : undefined,
    };
  }

  @Get('/cases')
  @OpenAPI({ summary: 'Return a list of cases for current logged in user' })
  @UseBefore(authMiddleware)
  async getCases(@Req() req: RequestWithUser): Promise<ApiResponse<CaseStatusResponse[]>> {
    const { representing } = req?.session;

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    if (representing?.mode === RepresentingMode.BUSINESS) {
      if (!representing?.BUSINESS) {
        throw new HttpException(400, 'Bad Request');
      }

      const orgNumber = formatOrgNr(representing.BUSINESS.organizationNumber);

      if (USE_CASES_CACHE && req.session.cache?.cases?.BUSINESS?.[orgNumber]) {
        return { data: req.session.cache.cases.BUSINESS[orgNumber], message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/${orgNumber}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);
        if (!res.data) {
          throw new HttpException(500, 'No data from API');
        }
        const cases = res.data.filter(caseIsallowed);
        this.setCasesCache(req, cases);

        return { data: cases, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setCasesCache(req, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          return { data: [], message: 'error' };
        }
      }
    } else {
      if (USE_CASES_CACHE && req.session.cache?.cases?.PRIVATE) {
        return { data: req.session.cache.cases.PRIVATE, message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/party/${req.user.partyId}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);
        if (!res.data) {
          throw new HttpException(500, 'No data from API');
        }
        const cases = res.data.filter(caseIsallowed);
        this.setCasesCache(req, cases);

        return { data: cases, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setCasesCache(req, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          throw new HttpException(500, 'Something went wrong');
        }
      }
    }
  }

  @Get('/cases/:caseId')
  @OpenAPI({ summary: 'Return a case' })
  @UseBefore(authMiddleware)
  async getCase(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<CaseStatusResponse | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      // First check cache for specific case
      const cachedCase = this.getCaseFromCache(req, caseId);
      if (cachedCase) {
        return { data: cachedCase, message: 'success' };
      }
      // If not found in cache, fetch from API
      const res = await this.getCases(req);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      const _case = res.data.filter(caseIsallowed).find(c => c.caseId === caseId);

      if (_case === undefined) {
        throw new HttpException(404, 'Case not found');
      }

      return { data: _case, message: 'success' };
    } catch (error) {
      console.error(error);
      if (error.status === 404) {
        throw new HttpException(404, 'Case not found');
      }
      throw new HttpException(500, 'Something went wrong');
    }
  }

  @Get('/cases/:caseId/pdf')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by case caseId' })
  @UseBefore(authMiddleware)
  async getCasePdf(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<string>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId))?.data;

    if (_case === undefined) {
      throw new HttpException(400, 'Bad request');
    }

    // Only OpenE errands has pdf at the moment.
    if (_case.system !== 'OPEN_E_PLATFORM') {
      throw new HttpException(404, 'Not found');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/${_case.externalCaseId}/pdf`;
    const res = await this.apiService.get<CasePdfResponse>({ url }, req);

    if (!res.data) {
      return { data: null, message: 'error' };
    }

    return { data: res.data.base64, message: 'success' };
  }

  // Messages
  @Get('/cases/:caseId/messages')
  @OpenAPI({ summary: 'Return messages for a case' })
  @UseBefore(authMiddleware)
  async getCaseMessages(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<FrontendMessageResponse[] | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId))?.data;

    if (_case === undefined) {
      throw new HttpException(400, 'Bad request');
    }

    const onlyNewIds = (seenMessages: Message[]) => (message: Message) => {
      const mIds = seenMessages.map(m => m.id) || [];
      return !mIds.includes(message.id);
    };

    const handleMessageResponse = (
      seenMessages: MessageWithConversationId<Message>[],
      responseMessages: Message[],
      conversationId: string,
    ): MessageWithConversationId<Message>[] => {
      return responseMessages
        .filter(msg => onlyNewIds(seenMessages)(msg) && msg.type === MessageTypeEnum.USER_CREATED)
        .map(msg => ({ ...msg, conversationId }));
    };

    try {
      let url: string;
      let data: FrontendMessageResponse[];
      if (_case.system === 'CASE_DATA') {
        const conversationUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations`;
        const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
        const externalConversations = filterExternalConversation(resConversation.data);
        const messages: MessageWithConversationId<Message>[] = [];

        for (const conversation of externalConversations) {
          const messagesUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations/${
            conversation.id
          }/messages?page=0&size=9000`;
          const resMessages = await this.apiService.get<PageMessage>({ url: messagesUrl }, req);
          if (resMessages.data) {
            const messagesWithConversationId = handleMessageResponse(messages, resMessages.data.content, conversation.id);
            messages.push(...messagesWithConversationId);
          }
        }

        data = await this.normalizeConversationMessages(messages, req.user);
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        const conversationUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations`;
        const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
        const externalConversations = filterExternalConversation(resConversation.data);
        const messages: MessageWithConversationId<Message>[] = [];

        for (const conversation of externalConversations) {
          const messagesUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
            _case.namespace
          }/errands/${caseId}/communication/conversations/${conversation.id}/messages?page=0&size=9000`;
          const resMessages = await this.apiService.get<PageMessage>({ url: messagesUrl }, req);
          if (resMessages.data) {
            const messagesWithConversationId = handleMessageResponse(messages, resMessages.data.content, conversation.id);
            messages.push(...messagesWithConversationId);
          }
        }

        data = await this.normalizeConversationMessages(messages, req.user);
      } else if (_case.system === 'OPEN_E_PLATFORM') {
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/flow-instances/${caseId}`;
        const resWebMessageCollector = await this.apiService.get<MessageDTO[]>({ url }, req);
        if (!resWebMessageCollector.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = this.normalizeWebMessageCollectorMessages(resWebMessageCollector.data);
      } else if (_case.system === 'BYGGR' || _case.system === 'ECOS') {
        // NOTE: BYGGR and ECOS are using externalCaseId
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/flow-instances/${_case.externalCaseId}`;
        const resWebMessageCollector = await this.apiService.get<MessageDTO[]>({ url }, req);
        if (!resWebMessageCollector.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = this.normalizeWebMessageCollectorMessages(resWebMessageCollector.data);
      } else {
        throw new HttpException(400, 'Bad request');
      }

      if (!data) {
        throw new HttpException(500, 'No data from API');
      }

      const messages = data.sort((a, b) => {
        if (!a.sent && !b.sent) return 0;
        if (!a.sent) return 1;
        if (!b.sent) return -1;
        return dayjs(b.sent).isBefore(dayjs(a.sent)) ? -1 : 1;
      });

      return { data: messages, message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        // handle 404 as empty
        return { data: [], message: 'success' };
      }
      throw new HttpException(error.status, error.message);
    }
  }

  // TODO: När api:erna får officiellt stöd för att visa och stämpla viewed så kan denna säkerställas
  // endast preliminär-riggad nu
  // snurran finns implementerad i frontend men utkommenterad
  @Put('/cases/:caseId/messages/:messageId/viewed/:isViewed')
  @OpenAPI({ summary: 'Set message isViewed status' })
  @UseBefore(authMiddleware)
  async setMessageViewed(
    @Req() req: RequestWithUser,
    @Param('caseId') caseId: string,
    @Param('messageId') messageId: string,
    @Param('isViewed') isViewed: boolean,
  ): Promise<ApiResponse<boolean>> {
    try {
      const _case = (await this.getCase(req, caseId)).data;
      let url: string;
      if (_case.system === 'CASE_DATA') {
        url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages/${messageId}/viewed/${isViewed}`;
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/${messageId}/viewed/${isViewed}`;
      } else if (_case.system === 'OPEN_E_PLATFORM') {
        // doesnt exist yet
        throw new HttpException(400, 'Not yet implemented');
      } else {
        throw new HttpException(400, 'Bad request');
      }

      await this.apiService.put<204>({ url }, req);
      return { data: true, message: 'success' };
    } catch {
      throw new HttpException(500, 'Could not set message as viewed');
    }
  }

  @Post('/cases/:caseId/messages')
  @OpenAPI({ summary: 'Create case message' })
  @UseBefore(authMiddleware)
  async newCaseMessage(
    @Req() req: RequestWithUser,
    @Param('caseId') caseId: string,
    @Body() body: CaseMessage,
    @UploadedFiles('files', { options: fileUploadOptions, required: false }) files?: Express.Multer.File[],
  ): Promise<any> {
    await validateRequestBody(CaseMessageDto, body);

    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId)).data;

    let url: string;
    let headers: Record<string, string> = {};
    let data: MessageRequest | WebMessageRequest | MessagingWebMessageRequest | FormData;
    if (_case.system === 'CASE_DATA') {
      const conversationUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations`;
      const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
      let conversation: Conversation;

      const externalConversation = findExternalConversation(resConversation.data);
      if (!resConversation.data || resConversation.data.length === 0 || !externalConversation) {
        const createConversationUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations`;
        const createConversationdata = this.conversationInit(req.user);
        const resCreateConversation = await this.apiService.post({ data: createConversationdata, url: createConversationUrl }, req);

        if (resCreateConversation.message === 'success') {
          const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
          const external = resConversation.data?.find(con => con.type === 'EXTERNAL');
          if (!external) {
            throw new HttpException(500, 'Could not find created EXTERNAL conversation');
          }
          conversation = external;
        } else {
          throw new HttpException(500, 'Could not create conversation');
        }
      } else {
        conversation = externalConversation;
      }
      url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations/${
        conversation.id
      }/messages`;
      headers = {
        'Content-Type': 'multipart/form-data',
      };

      const messageData = {
        content: body.message,
      };

      const formData = new FormData();
      formData.append('message', JSON.stringify(messageData));
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        });
      }
      data = formData;
    } else if (_case.system === 'SUPPORT_MANAGEMENT') {
      const conversationUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
        _case.namespace
      }/errands/${caseId}/communication/conversations`;
      const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
      let conversation: Conversation;

      const externalConversation = findExternalConversation(resConversation.data);
      if (!resConversation.data || resConversation.data.length === 0 || !externalConversation) {
        const createConversationUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations`;
        const createConversationdata = this.conversationInit(req.user);
        const resCreateConversation = await this.apiService.post({ data: createConversationdata, url: createConversationUrl }, req);

        if (resCreateConversation.message === 'success') {
          const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req);
          conversation = findExternalConversation(resConversation.data);
        }
      } else {
        conversation = externalConversation;
      }
      url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations/${
        conversation.id
      }/messages`;

      headers = {
        'Content-Type': 'multipart/form-data',
      };

      const messageData = {
        content: body.message,
      };

      const formData = new FormData();
      formData.append('message', JSON.stringify(messageData));
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        });
      }
      data = formData;
    } else if (_case.system === 'OPEN_E_PLATFORM') {
      url = `${getApiBase('messaging')}/${MUNICIPALITY_ID}/webmessage`;
      data = this.postMessageToMessagingMessage(req, caseId, body.message, files);
    } else if (_case.system === 'BYGGR' || _case.system === 'ECOS') {
      // NOTE: BYGGR and ECOS are using externalCaseId
      // url = `${getApiBase('messaging')}/${MUNICIPALITY_ID}/webmessage`;
      // data = this.postMessageToMessagingMessage(req, _case.externalCaseId, body.message, files);

      // At this time BYGGR and ECOS does not support sending messages
      throw new HttpException(501, 'Not implemented yet');
    } else {
      throw new HttpException(400, 'Bad request');
    }

    try {
      const defaultHeaders = {
        'x-origin': 'MYPAGES',
        'X-Sent-By': `${req.user.partyId};type=partyId`,
      };

      await this.apiService.post(
        {
          url,
          data,
          headers: {
            ...headers,
            ...defaultHeaders,
          },
        },
        req,
      );
    } catch {
      throw new HttpException(500, 'Could not send message');
    }

    try {
      const messages = (await this.getCaseMessages(req, caseId)).data;
      return { data: messages, message: 'success' };
    } catch {
      throw new HttpException(500, 'Could not fetch messages');
    }
  }

  // attachments
  @Get('/cases/:caseId/conversations/:conversationId/messages/:messageId/attachments/:attachmentId')
  @OpenAPI({ summary: 'Return message attachment' })
  @UseBefore(authMiddleware)
  async getCaseMessageAttachment(
    @Req() req: RequestWithUser,
    @Param('caseId') caseId: string,
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<ApiResponse<string | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId)).data;

    try {
      let url: string;
      if (_case.system === 'CASE_DATA') {
        url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`;
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`;
      } else if (_case.system === 'OPEN_E_PLATFORM' || _case.system === 'BYGGR' || _case.system === 'ECOS') {
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/attachments/${attachmentId}`;
      } else {
        throw new HttpException(400, 'Bad request');
      }

      const res = await this.apiService.get<string>({ url, responseType: 'arraybuffer', responseEncoding: 'base64' }, req);

      if (!res.data) {
        return { data: null, message: 'error' };
      }

      const base64 = Buffer.from(res.data).toString('base64');

      return { data: base64, message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        // handle 404 as empty´
        return { data: null, message: 'success' };
      }
      return { data: null, message: 'error' };
    }
  }
}
