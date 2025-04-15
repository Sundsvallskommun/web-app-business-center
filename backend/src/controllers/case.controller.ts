import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Classification, MessageRequest, MessageRequestDirectionEnum, MessageResponse } from '@/data-contracts/case-data/data-contracts';
import { CasePdfResponse, CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { CaseMessageDto } from '@/dtos/case-data.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { CaseMessage } from '@/interfaces/case.interface';
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
      this.setBusinesCasesCache(req, req.session.representing.BUSINESS.organizationNumber, data);
    } else {
      this.setPrivateCasesCache(req, data);
    }
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

        this.setBusinesCasesCache(req, orgNumber, res.data);

        return { data: res.data, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setBusinesCasesCache(req, orgNumber, []);
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

        this.setPrivateCasesCache(req, res.data);

        return { data: res.data, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setPrivateCasesCache(req, []);
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

      const _case = res.data.find(c => c.caseId === caseId);

      return { data: _case, message: 'success' };
    } catch (error) {
      console.error(error);
      if (error.status === 404) {
        throw new HttpException(404, 'Case not found');
      }
      throw new HttpException(500, 'Something went wrong');
    }
  }

  @Get('/cases/:externalCaseId/casepdf')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by case externalCaseId' })
  @UseBefore(authMiddleware)
  async getCasePdf(@Req() req: RequestWithUser, @Param('externalCaseId') externalCaseId: string): Promise<ApiResponse<CasePdfResponse>> {
    if (!externalCaseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/${externalCaseId}/pdf`;
    const res = await this.apiService.get<CasePdfResponse>({ url }, req);

    return { data: res.data, message: 'success' };
  }

  // Messages
  @Get('/cases/:caseId/messages')
  @OpenAPI({ summary: 'Return messages for a case' })
  @UseBefore(authMiddleware)
  async getCaseMessages(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<MessageResponse[] | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const _case = (await this.getCase(req, caseId))?.data;

    if (_case === undefined) {
      throw new HttpException(400, 'Bad request');
    }

    if (_case.system === 'CASE_DATA') {
      try {
        const url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages`;
        const res = await this.apiService.get<MessageResponse[]>({ url }, req);

        if (!res.data) {
          throw new HttpException(500, 'No data from API');
        }

        const messages = res.data
          .filter(m => (m.internal === undefined ? true : m.internal === false)) // filter out internal messages
          .sort((a, b) => {
            if (!a.sent && !b.sent) return 0;
            if (!a.sent) return 1;
            if (!b.sent) return -1;
            return dayjs(b.sent).isBefore(dayjs(a.sent)) ? -1 : 1;
          })
          .map(m => {
            if (m.direction === 'OUTBOUND') {
              m.viewed = m.viewed ?? false;
            } else {
              // dont show if manager have viewed the message or not
              delete m.viewed;
            }
            m.viewed = true; // how viewed should work is not yet clear, therefore setting all to viewed
            delete m.internal; // remove internal property from response
            return m;
          });

        return { data: messages, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          // handle 404 as empty
          return { data: [], message: 'success' };
        }
        throw new HttpException(500, 'Something went wrong');
      }
    }
    return { data: [], message: 'success' };
  }

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
      const url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages/${messageId}/viewed/${isViewed}`;
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

    if (_case.system === 'CASE_DATA') {
      const data: MessageRequest = {
        message: body.message,
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

      try {
        const url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${_case.namespace}/errands/${caseId}/messages`;
        await this.apiService.post({ url, data: data }, req);

        const messages = (await this.getCaseMessages(req, caseId)).data;
        return { data: messages, message: 'success' };
      } catch {
        throw new HttpException(500, 'Could not fetch messages');
      }
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

    if (_case.system === 'CASE_DATA') {
      try {
        const url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/${
          _case.namespace
        }/errands/${caseId}/messages/${messageId}/attachments/${attachmentId}`;

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
}
