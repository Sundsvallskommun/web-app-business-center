import { MUNICIPALITY_ID } from '@/config';
import { MessageRequest, MessageResponse } from '@/data-contracts/case-data/data-contracts';
import { MessageRequestDTO } from '@/dtos/case-data.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import ApiService from '@/services/api.service';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import authMiddleware from '@middlewares/auth.middleware';
import { Body, Controller, Get, HttpCode, Param, Post, Put, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../interfaces/service';
import { getApiBase } from '@/config/api-config';

@Controller()
export class CaseDataController {
  private apiService = new ApiService();
  private apiBase = getApiBase('case-data');

  @Get('/case-data/messages/:errandNumber')
  @OpenAPI({ summary: 'Return messages for a case' })
  @UseBefore(authMiddleware)
  async getCaseMessages(@Req() req: RequestWithUser, @Param('errandNumber') errandNumber: string): Promise<ApiResponse<MessageResponse[] | null>> {
    if (!errandNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/messages/${errandNumber}`;
      const res = await this.apiService.get<MessageResponse[]>({ url }, req);

      if (!res.data) {
        return { data: null, message: 'error' };
      }

      return { data: res.data, message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        // handle 404 as empty
        return { data: [], message: 'success' };
      }
      return { data: null, message: 'error' };
    }
  }

  @Post('/case-data/messages/:errandNumber')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create case message' })
  @UseBefore(authMiddleware, validationMiddleware(MessageRequestDTO, 'body'))
  async newContactSettings(
    @Req() req: RequestWithUser,
    @Param('errandNumber') errandNumber: string,
    @UploadedFiles('files', { options: fileUploadOptions, required: false }) files: Express.Multer.File[],
    @Body() message: MessageRequestDTO,
  ): Promise<any> {
    if (!errandNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    const data: MessageRequest = {
      ...message,
      messageId: uuidv4(),
      externalCaseId: errandNumber,
      firstName: req.user.givenName,
      lastName: req.user.surname,
      attachments: files.map(x => ({ content: x.buffer.toString('base64'), name: x.filename, contentType: x.mimetype })),
    };

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/messages`;
    const res = await this.apiService.post({ url, data: data }, req);
    return { data: res.data, message: 'success' };
  }

  @Put('/cases/:externalCaseId/messages/:messageId/viewed/:isViewed')
  @OpenAPI({ summary: 'Set message isViewed status' })
  @HttpCode(201)
  @UseBefore(authMiddleware)
  async setMessageViewed(
    @Req() req: RequestWithUser,
    @Param('messageId') messageId: string,
    @Param('isViewed') isViewed: boolean,
  ): Promise<ApiResponse<201>> {
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/messages/${messageId}/viewed/${isViewed}`;
    const res = await this.apiService.put<201>({ url }, req);
    return { data: res.data, message: 'success' };
  }
}
