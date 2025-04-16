import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  Classification,
  MessageRequest,
  MessageRequestDirectionEnum,
  MessageResponse,
  MessageResponseDirectionEnum,
} from '@/data-contracts/case-data/data-contracts';
import { CasePdfResponse, CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { CaseMessageDto } from '@/dtos/case-data.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { CaseMessage, FrontendMessageResponse } from '@/interfaces/case.interface';
import ApiService from '@/services/api.service';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { validateRequestBody } from '@/utils/validate';
import authMiddleware from '@middlewares/auth.middleware';
import dayjs from 'dayjs';
import { Body, Controller, Get, Param, Post, Put, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { v4 as uuidv4 } from 'uuid';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse } from '../interfaces/service';
import { formatOrgNr } from '../utils/util';
import { Communication, WebMessageRequest } from '@/data-contracts/supportmanagement/data-contracts';
import { MessageDTO } from '@/interfaces/tmp';
import { WebMessageRequest as MessagingWebMessageRequest } from '@/data-contracts/messaging/data-contracts';

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

  private normalizeCaseDataMessages(messages: MessageResponse[]): FrontendMessageResponse[] {
    return messages
      .filter(message => (message.internal === undefined ? true : message.internal === false))
      .map(message => ({
        messageId: message.messageId,
        direction: message.direction,
        message: message.message,
        sent: message.sent,
        sender: `${message.firstName} ${message.lastName}`,
        attachments: message.attachments,
      }));
  }

  private postMessageToCaseDataMessage(req: RequestWithUser, message: string, files: Express.Multer.File[]): MessageRequest {
    return {
      message: message,
      direction: MessageRequestDirectionEnum.INBOUND,
      internal: false,
      messageId: uuidv4(), // ska tas bort, väntar på att api:t justeras
      username: req.user.username,
      firstName: req.user.givenName,
      lastName: req.user.surname,
      sent: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'), // ska tas bort, väntar på att api:t justeras
      messageType: 'MYPAGES',

      // subject: 'Meddelande från Mina sidor',
      classification: Classification.OTHER,

      attachments: files?.map(x => ({ content: x.buffer.toString('base64'), name: x.originalname, contentType: x.mimetype })),
    };
  }

  private normalizeSupportManagementMessages(communications: Communication[]): FrontendMessageResponse[] {
    return communications
      .filter(m => (m.internal === undefined ? true : m.internal === false))
      .map(communication => ({
        messageId: communication.communicationID,
        direction: communication.direction === 'OUTBOUND' ? MessageResponseDirectionEnum.OUTBOUND : MessageResponseDirectionEnum.INBOUND,
        message: communication.messageBody,
        sent: communication.sent,
        sender: communication.sender,
        attachments: communication.communicationAttachments.map(attachment => ({
          attachmentId: attachment.id,
          name: attachment.fileName,
          contentType: attachment.mimeType,
        })),
      }));
  }

  private postMessageToSupportManagementMessage(message: string, files: Express.Multer.File[]): WebMessageRequest {
    return {
      message: message,
      dispatch: false,
      internal: false,
      attachments: files?.map(x => ({ base64EncodedString: x.buffer.toString('base64'), fileName: x.originalname })),
    };
  }

  private normalizeWebMessageCollectorMessages(messages: MessageDTO[]): FrontendMessageResponse[] {
    return messages.map(message => ({
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
      //sendAsOwner: true, // TODO: utkommentera när api-stöd släppts ska vara true för att skicka partyId som avsändare
      party: {
        partyId: req.user.partyId, // ska tydligen inte användas?
        externalReferences: [
          {
            key: 'flowInstanceId',
            value: caseId,
          },
        ],
      },
      message: message,
      attachments: files?.map(x => ({ base64Data: x.buffer.toString('base64'), fileName: x.originalname, mimeType: x.mimetype })),
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

      if (req.session.cache?.cases?.BUSINESS?.[orgNumber]) {
        return { data: req.session.cache.cases.BUSINESS[orgNumber], message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/${orgNumber}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);

        this.setCasesCache(req, res.data);

        return { data: res.data, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setCasesCache(req, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          return { data: [], message: 'error' };
        }
      }
    } else {
      if (req.session.cache?.cases?.PRIVATE) {
        return { data: req.session.cache.cases.PRIVATE, message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/party/${req.user.partyId}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);

        if (!res.data) {
          throw new HttpException(500, 'No data from API');
        }

        this.setCasesCache(req, res.data);

        return { data: res.data, message: 'success' };
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
      const res = await this.getCases(req);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      const _case = res.data.find(c => c.caseId === caseId);

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

    try {
      let url: string;
      let data: FrontendMessageResponse[];
      if (_case.system === 'CASE_DATA') {
        url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages`;
        const resCaseData = await this.apiService.get<MessageResponse[]>({ url }, req);
        if (!resCaseData.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = this.normalizeCaseDataMessages(resCaseData.data);
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication`;
        const resSupportManagement = await this.apiService.get<Communication[]>({ url }, req);
        if (!resSupportManagement.data) {
          throw new HttpException(500, 'No data from API');
        }
        data = this.normalizeSupportManagementMessages(resSupportManagement.data);
      } else if (_case.system === 'OPEN_E_PLATFORM') {
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/${caseId}`;
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
    let data: MessageRequest | WebMessageRequest | MessagingWebMessageRequest;
    if (_case.system === 'CASE_DATA') {
      url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages`;
      data = this.postMessageToCaseDataMessage(req, body.message, files);
    } else if (_case.system === 'SUPPORT_MANAGEMENT') {
      url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/communication/webmessage`;
      data = this.postMessageToSupportManagementMessage(body.message, files);
      headers = {
        'X-Sent-By': `${req.user.partyId};type=partyId`,
      };
    } else if (_case.system === 'OPEN_E_PLATFORM') {
      url = `${getApiBase('messaging')}/${MUNICIPALITY_ID}/messages/webmessage`;
      data = this.postMessageToMessagingMessage(req, caseId, body.message, files);
      headers = {
        'x-origin': 'MYPAGES',
      };
    } else {
      throw new HttpException(400, 'Bad request');
    }

    try {
      await this.apiService.post({ url, data, headers }, req);
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
  @Get('/cases/:caseId/messages/:messageId/attachments/:attachmentId')
  @OpenAPI({ summary: 'Return message attachment' })
  @UseBefore(authMiddleware)
  async getCaseMessageAttachment(
    @Req() req: RequestWithUser,
    @Param('caseId') caseId: string,
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
        url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages/${messageId}/attachments/${attachmentId}`;
      } else if (_case.system === 'SUPPORT_MANAGEMENT') {
        url = `${getApiBase('supportmanagement')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/communication/${messageId}/attachments/${attachmentId}`;
      } else if (_case.system === 'OPEN_E_PLATFORM') {
        url = `${getApiBase('webmessagecollector')}/${MUNICIPALITY_ID}/messages/EXTERNAL/${caseId}/attachments/${attachmentId}`;
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
        // handle 404 as empty
        return { data: null, message: 'success' };
      }
      return { data: null, message: 'error' };
    }
  }
}
