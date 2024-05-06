import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { IsString } from 'class-validator';
import { Body, Controller, Delete, Get, HttpCode, OnUndefined, Param, Patch, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface ResponseData {
  data: ReminderResponse[];
  message: string;
}

export interface ReminderResponse {
  action: string;
  note: string;
  caseId: string;
  caseLink: string;
  reminderDate: string;
  caseType: string;
  externalCaseId: string;
  createdBy: string;
  created: string;
  modified: string;
  modifiedBy: string;
}

export type NewReminderOmittedTypes = 'created' | 'modified' | 'modifiedBy';
export interface NewReminder extends Omit<ReminderResponse, NewReminderOmittedTypes> {
  partyId: string;
}

export type EditReminderOmittedTypes = 'created' | 'modified' | 'createdBy';
export interface EditReminder extends Omit<ReminderResponse, EditReminderOmittedTypes> {
  partyId: string;
}

export class CreateReminderDto {
  @IsString()
  action: string;
  @IsString()
  note: string;
  @IsString()
  caseId: string;
  @IsString()
  caseLink: string;
  @IsString()
  reminderDate: string;
  @IsString()
  caseType: string;
  @IsString()
  externalCaseId: string;
}

@Controller()
export class RemindInformController {
  private apiService = new ApiService();

  @Get('/reminders')
  @OpenAPI({ summary: 'Return a list of reminders for current logged in user' })
  @UseBefore(authMiddleware)
  async reminders(@Req() req: RequestWithUser, @Res() response: any): Promise<ResponseData> {
    const { organizationId } = req?.session?.representing;

    const url = `reminders/3.0/reminders/parties/${organizationId}`;
    const res = await this.apiService.get<ReminderResponse[]>({ url });

    if (Array.isArray(res.data) && res.data.length < 1) {
      throw new HttpException(404, 'Not Found');
    }

    return response.send({ data: res.data, message: 'success' });
  }

  @Post('/reminders')
  @HttpCode(201)
  @OpenAPI({ summary: 'Post a new reminder for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateReminderDto, 'body'))
  async newReminder(@Req() req: RequestWithUser, @Body() userData: CreateReminderDto): Promise<ResponseData> {
    const { user } = req;
    const { organizationId } = req?.session?.representing;

    const newReminder: NewReminder = {
      ...userData,
      partyId: organizationId,
      createdBy: user.name,
    };
    const url = `reminders/3.0/reminders`;
    const res = await this.apiService.post<ReminderResponse[]>({ url, data: newReminder });

    return { data: res.data, message: 'success' };
  }

  @Patch('/reminders/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Edit a reminder for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateReminderDto, 'body'))
  async editNote(@Req() req: RequestWithUser, @Param('id') id: string, @Body() userData: CreateReminderDto): Promise<void> {
    const { user } = req;
    const { organizationId } = req?.session?.representing;

    const editReminder: EditReminder = {
      ...userData,
      partyId: organizationId,
      modifiedBy: user.name,
    };

    const url = `reminders/3.0/reminders/${id}`;
    await this.apiService.patch<ReminderResponse[]>({ url, data: editReminder });
  }

  @Delete('/reminders/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Remove a reminder for current logged in user' })
  @UseBefore(authMiddleware)
  async deleteNote(@Req() req: RequestWithUser, @Param('id') id: string): Promise<void> {
    const url = `reminders/3.0/reminders/${id}`;
    await this.apiService.delete({ url });
  }
}
