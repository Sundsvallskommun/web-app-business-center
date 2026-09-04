import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Conversation, Message, MessageRequest, PageMessage } from '@/data-contracts/case-data/data-contracts';
import { CasePdfResponse, CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { WebMessageRequest as MessagingWebMessageRequest } from '@/data-contracts/messaging/data-contracts';
import { WebMessageRequest } from '@/data-contracts/supportmanagement/data-contracts';
import { MessageDTO } from '@/data-contracts/webmessagecollector/data-contracts';
import { CaseMessageDto } from '@/dtos/case-data.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { CaseMessage, FrontendMessageResponse, MessageWithConversationId } from '@/interfaces/case.interface';
import ApiService from '@/services/api.service';
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
import { getCitizen } from '@/services/citizen.service';
import { getUserData } from '@/services/user.service';
import { filterExternalConversation, findExternalConversation } from '@/utils/conversation-utils';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { validateRequestBody } from '@/utils/validate';
import { User } from '@interfaces/users.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { CaseMessagesApiResponse, CasesApiResponse } from '@/responses/case.response';
import { Body, Controller, Get, Param, Post, Put, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse } from '../interfaces/service';
import { formatOrgNr } from '../utils/util';

const USE_CASES_CACHE = false;

// A case is referenced in URLs by its human-readable errandNumber (ärendenummer) when available,
// and otherwise by its internal caseId (e.g. OpenE cases, which have no errandNumber).
// Internal callers pass an actual caseId, which still matches here.
const caseMatchesReference = (c: CaseStatusResponse, reference: string) => c.errandNumber === reference || c.caseId === reference;

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

  private setCasesCache(req: RequestWithUser, data: CaseStatusResponse[]) {
    const { representing } = req.session;
    if (!representing) {
      throw new HttpException(400, 'Bad Request');
    }
    if (representing.mode === RepresentingMode.BUSINESS) {
      const orgNumber = representing.BUSINESS && formatOrgNr(representing.BUSINESS.organizationNumber);
      if (!orgNumber) {
        throw new HttpException(400, 'Bad Request');
      }
      this.setBusinesCasesCache(req, orgNumber, data);
    } else {
      this.setPrivateCasesCache(req, data);
    }
  }

  private getCaseFromCache(req: RequestWithUser, caseId: string): CaseStatusResponse | null {
    const { representing } = req.session;
    if (!representing) {
      throw new HttpException(400, 'Bad Request');
    }
    let cases: CaseStatusResponse[] | null;
    if (representing.mode === RepresentingMode.BUSINESS) {
      const orgNumber = representing.BUSINESS && formatOrgNr(representing.BUSINESS.organizationNumber);
      if (!orgNumber) {
        throw new HttpException(400, 'Bad Request');
      }
      cases = req.session.cache?.cases?.BUSINESS?.[orgNumber] ?? null;
    } else {
      cases = req.session.cache?.cases?.PRIVATE ?? null;
    }
    return cases?.find(c => caseMatchesReference(c, caseId)) ?? null;
  }

  private async normalizeConversationMessages(messages: MessageWithConversationId<Message>[], user: User): Promise<FrontendMessageResponse[]> {
    const { adUsernames, citizenPartyIds } = collectSenderIdentifiers(messages);

    interface NameMap {
      identifier: string;
      name: string;
    }

    const adUsernamePromises: Promise<NameMap>[] = adUsernames.map(async username => {
      const userData = await getUserData(username, { user } as RequestWithUser);
      return {
        identifier: username,
        name: `${userData.givenname} ${userData.lastname}`,
      };
    });

    const citizenNamePromises: Promise<NameMap>[] = citizenPartyIds.map(async partyId => {
      const citizenData = await getCitizen(partyId, { user });
      return {
        identifier: partyId,
        name: `${citizenData.givenname} ${citizenData.lastname}`,
      };
    });

    const results = await Promise.allSettled([...adUsernamePromises, ...citizenNamePromises]);
    const nameMap = results.reduce((acc: Record<string, string>, result) => {
      if (result.status === 'fulfilled') {
        acc[result.value.identifier] = result.value.name;
      }
      return acc;
    }, {});

    return messages.map(msg => toFrontendMessage(msg, nameMap, user));
  }

  private readonly fetchAttachment = async (url: string, req: RequestWithUser): Promise<ApiResponse<string | null>> => {
    try {
      const res = await this.apiService.get<string>({ url, responseType: 'arraybuffer', responseEncoding: 'base64' }, req.user);

      if (!res.data) {
        return { data: null, message: 'error' };
      }

      const base64 = Buffer.from(res.data).toString('base64');

      return { data: base64, message: 'success' };
    } catch (error: any) {
      if (error.status === 404) {
        // handle 404 as empty´
        return { data: null, message: 'success' };
      }
      return { data: null, message: 'error' };
    }
  };

  @Get('/cases')
  @OpenAPI({ summary: 'Return a list of cases for current logged in user' })
  @ResponseSchema(CasesApiResponse)
  @UseBefore(authMiddleware)
  async getCases(@Req() req: RequestWithUser): Promise<ApiResponse<CaseStatusResponse[]>> {
    const { representing } = req?.session;

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    const fetchCases = async (url: string) => {
      try {
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req.user);
        if (!res.data) {
          throw new HttpException(500, 'No data from API');
        }
        const cases = res.data.filter(caseIsAllowed);
        this.setCasesCache(req, cases);

        return { data: cases, message: 'success' };
      } catch (error: any) {
        if (error.status === 404) {
          this.setCasesCache(req, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          return { data: [], message: 'error' };
        }
      }
    };
    let url;

    if (representing?.mode === RepresentingMode.BUSINESS) {
      if (!representing?.BUSINESS) {
        throw new HttpException(400, 'Bad Request');
      }
      const orgNumber = formatOrgNr(representing.BUSINESS.organizationNumber);
      if (!orgNumber) {
        throw new HttpException(400, 'Bad Request');
      }
      if (USE_CASES_CACHE && req.session.cache?.cases?.BUSINESS?.[orgNumber]) {
        return { data: req.session.cache.cases.BUSINESS[orgNumber], message: 'success' };
      }

      url = `${this.apiBase}/${MUNICIPALITY_ID}/${orgNumber}/statuses`;
    } else {
      if (USE_CASES_CACHE && req.session.cache?.cases?.PRIVATE) {
        return { data: req.session.cache.cases.PRIVATE, message: 'success' };
      }

      url = `${this.apiBase}/${MUNICIPALITY_ID}/party/${req.user.partyId}/statuses?includeDrafts=true`;
    }

    return fetchCases(url);
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

      const _case = res.data.filter(caseIsAllowed).find(c => caseMatchesReference(c, caseId));

      if (_case === undefined) {
        throw new HttpException(404, 'Case not found');
      }

      return { data: _case, message: 'success' };
    } catch (error: any) {
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
  async getCasePdf(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<string | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId))?.data;

    if (!_case) {
      throw new HttpException(400, 'Bad request');
    }

    // Only OpenE errands has pdf at the moment.
    if (_case.system !== 'OPEN_E_PLATFORM') {
      throw new HttpException(404, 'Not found');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/${_case.externalCaseId}/pdf`;
    const res = await this.apiService.get<CasePdfResponse>({ url }, req.user);

    if (!res.data) {
      return { data: null, message: 'error' };
    }

    return { data: res.data.base64 ?? null, message: 'success' };
  }

  // Messages
  @Get('/cases/:caseId/messages')
  @OpenAPI({ summary: 'Return messages for a case' })
  @ResponseSchema(CaseMessagesApiResponse)
  @UseBefore(authMiddleware)
  async getCaseMessages(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<FrontendMessageResponse[] | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId))?.data;

    if (!_case) {
      throw new HttpException(400, 'Bad request');
    }

    try {
      let url: string;
      let data: FrontendMessageResponse[];
      if (_case.system === 'CASE_DATA') {
        const conversationUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations`;
        const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req.user);
        const externalConversations = filterExternalConversation(resConversation.data);
        const messages: MessageWithConversationId<Message>[] = [];

        for (const conversation of externalConversations) {
          const messagesUrl = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations/${
            conversation.id
          }/messages?page=0&size=9000`;
          const resMessages = await this.apiService.get<PageMessage>({ url: messagesUrl }, req.user);
          if (resMessages.data) {
            const messagesWithConversationId = filterNewUserMessages(messages, resMessages.data.content ?? [], conversation.id ?? '');
            messages.push(...messagesWithConversationId);
          }
        }

        data = await this.normalizeConversationMessages(messages, req.user);
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        const conversationUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/conversations`;
        const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req.user);
        const externalConversations = filterExternalConversation(resConversation.data);
        const messages: MessageWithConversationId<Message>[] = [];

        for (const conversation of externalConversations) {
          const messagesUrl = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
            _case.namespace
          }/errands/${caseId}/communication/conversations/${conversation.id}/messages?page=0&size=9000`;
          const resMessages = await this.apiService.get<PageMessage>({ url: messagesUrl }, req.user);
          if (resMessages.data) {
            const messagesWithConversationId = filterNewUserMessages(messages, resMessages.data.content ?? [], conversation.id ?? '');
            messages.push(...messagesWithConversationId);
          }
        }

        data = await this.normalizeConversationMessages(messages, req.user);
      } else if (_case.system === 'OPEN_E_PLATFORM') {
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/flow-instances/${caseId}`;
        const resWebMessageCollector = await this.apiService.get<MessageDTO[]>({ url }, req.user);
        if (!resWebMessageCollector.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = normalizeWebMessageCollectorMessages(resWebMessageCollector.data);
      } else if (_case.system === 'BYGGR' || _case.system === 'ECOS') {
        // NOTE: BYGGR and ECOS are using externalCaseId
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/flow-instances/${_case.externalCaseId}`;
        const resWebMessageCollector = await this.apiService.get<MessageDTO[]>({ url }, req.user);
        if (!resWebMessageCollector.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = normalizeWebMessageCollectorMessages(resWebMessageCollector.data);
      } else {
        throw new HttpException(400, 'Bad request');
      }

      if (!data) {
        throw new HttpException(500, 'No data from API');
      }

      const messages = sortMessagesBySentDesc(data);

      return { data: messages, message: 'success' };
    } catch (error: any) {
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
      if (!_case) {
        throw new HttpException(400, 'Bad request');
      }
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

      await this.apiService.put<204, void>({ url }, req.user);
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
    if (!_case) {
      throw new HttpException(400, 'Bad request');
    }

    // url is assigned in every reachable branch below (directly or inside buildMessageData);
    // initialized empty to satisfy definite-assignment across the closure boundary.
    let url = '';
    let headers: Record<string, string> = {};
    let data: MessageRequest | WebMessageRequest | MessagingWebMessageRequest | FormData;

    const buildMessageData = async (apiBase: string) => {
      const conversationUrl = `${apiBase}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations`;
      const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req.user);
      let conversation: Conversation;

      const externalConversation = findExternalConversation(resConversation.data);
      if (!resConversation.data || resConversation.data.length === 0 || !externalConversation) {
        const createConversationUrl = `${apiBase}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations`;
        const createConversationdata = conversationInit(req.user);
        const resCreateConversation = await this.apiService.post<Conversation, typeof createConversationdata>(
          { data: createConversationdata, url: createConversationUrl },
          req.user,
        );

        if (resCreateConversation.message === 'success') {
          const resConversation = await this.apiService.get<Conversation[]>({ url: conversationUrl }, req.user);
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
      url = `${apiBase}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/conversations/${conversation.id}/messages`;
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
          formData.append('attachments', new Blob([file.buffer as BlobPart], { type: file.mimetype }), file.originalname);
        });
      }
      return formData;
    };

    if (_case.system === 'CASE_DATA') {
      const apiBase = getApiBase('case-data');
      data = await buildMessageData(apiBase);
    } else if (_case.system === 'SUPPORT_MANAGEMENT') {
      const apiBase = getApiBase('supportmanagement');
      data = await buildMessageData(apiBase);
    } else if (_case.system === 'OPEN_E_PLATFORM') {
      url = `${getApiBase('messaging')}/${MUNICIPALITY_ID}/webmessage`;
      data = buildMessagingWebMessageRequest(req.user.partyId, caseId, body.message, files ?? []);
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

      await this.apiService.post<void, typeof data>(
        {
          url,
          data,
          headers: {
            ...headers,
            ...defaultHeaders,
          },
        },
        req.user,
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
  @OpenAPI({ summary: 'Return message attachment for Casedata or Supportmanagement messages' })
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
    if (!_case) {
      throw new HttpException(400, 'Bad request');
    }

    let url: string;
    if (_case.system === 'CASE_DATA') {
      url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${
        _case.namespace
      }/errands/${caseId}/communication/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`;
    } else if (_case.system === 'SUPPORT_MANAGEMENT') {
      url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
        _case.namespace
      }/errands/${caseId}/communication/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`;
    } else {
      throw new HttpException(400, 'Bad request');
    }

    return this.fetchAttachment(url, req);
  }

  @Get('/cases/:caseId/messages/attachments/:attachmentId')
  @OpenAPI({ summary: 'Return message attachment for OpenE, BYGGR or ECOS cases' })
  @UseBefore(authMiddleware)
  async getWebmessageAttachment(
    @Req() req: RequestWithUser,
    @Param('caseId') caseId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<ApiResponse<string | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    // The attachment endpoint is keyed only by attachmentId, so a manipulated id could
    // otherwise reach another user's file. Verify the case belongs to the user and that
    // the requested attachment actually belongs to one of that case's messages.
    const _case = (await this.getCase(req, caseId)).data;
    if (!_case) {
      throw new HttpException(400, 'Bad request');
    }

    const messages = (await this.getCaseMessages(req, caseId)).data ?? [];
    const attachmentBelongsToCase = messages.some(message => message.attachments?.some(attachment => attachment.attachmentId === attachmentId));
    if (!attachmentBelongsToCase) {
      throw new HttpException(404, 'Attachment not found');
    }

    const url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/attachments/${attachmentId}`;
    return this.fetchAttachment(url, req);
  }
}
