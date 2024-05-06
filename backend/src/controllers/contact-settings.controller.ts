import { Body, Controller, Get, HttpCode, OnUndefined, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';
import authMiddleware from '@middlewares/auth.middleware';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import ApiService from '@/services/api.service';
import { HttpException } from '@/exceptions/HttpException';

export class ContactSettingChannel {
  @IsString()
  contactMethod: string;
  @IsString()
  destination: string;
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
  @IsOptional()
  @IsBoolean()
  sendFeedback?: boolean;
  @IsString()
  alias: string;
}

export class Meta {
  @IsNumber()
  page: number;
  @IsNumber()
  limit: number;
  @IsNumber()
  count: number;
  @IsNumber()
  totalRecords: number;
  @IsNumber()
  totalPages: number;
}

export class ContactSetting {
  @IsString()
  id: string;
  @IsString()
  partyId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSettingChannel)
  contactChannels: ContactSettingChannel[];
  @IsString()
  created: string;
  @IsString()
  modified: string;
}

export class ResponseData {
  @IsString()
  message: string;
  @ValidateNested()
  @Type(() => Array<ContactSetting>)
  data: Array<ContactSetting>;
}

export class UpdateContactSettingsDto {
  @IsString()
  id: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSettingChannel)
  contactChannels: ContactSettingChannel[];
}

export interface UpdateContactSettings {
  alias: string;
  contactChannels: ContactSettingChannel[];
}

export interface NewContactSettings extends UpdateContactSettings {
  partyId: string;
  createdById: string;
}

@Controller()
export class ContactSettingsController {
  private apiService = new ApiService();

  mapDisabledToSendFeedback(channels: ContactSettingChannel[]) {
    return channels.map(c => ({
      contactMethod: c.contactMethod,
      alias: c.alias,
      destination: c.destination,
      sendFeedback: !c.disabled,
    }));
  }

  mapSendFeedbackToDisabled(channels: ContactSettingChannel[]) {
    return channels.map(c => ({
      contactMethod: c.contactMethod,
      alias: c.alias,
      destination: c.destination,
      disabled: !c.sendFeedback,
    }));
  }

  @Get('/contactsettings')
  @OpenAPI({ summary: 'Return a list of contact settings' })
  @ResponseSchema(ResponseData)
  @UseBefore(authMiddleware)
  async cases(
    @Req() req: RequestWithUser,
    @QueryParam('limit', { required: false }) limit?: number,
    @QueryParam('page', { required: false }) page?: number,
  ): Promise<ResponseData> {
    const { organizationId } = req?.session?.representing;

    if (!organizationId) {
      throw new HttpException(403, 'Forbidden');
    }

    // FIXME: we probably want to go thru all pages?
    //        or do we want to have a load more button in UI?
    const url = 'contactsettings/1.0/settings';
    const params = {
      partyId: organizationId,
      page: page ?? 1,
      limit: limit ?? 100, // NOTE: 100 is max it seems
    };
    const res = await this.apiService.get<Array<ContactSetting>>({ url, params });

    if (!res.data.length) {
      throw new HttpException(404, 'Not Found');
    }

    // The field channel.disabled from the ContactSettings API is the boolean opposite of
    // the field channel.sendFeedback from the FeedbackSettings API. This field is therefore
    // remapped here in the controller, since the logic in the frontend is complicated and
    // is built for the sendFeedback value.
    //
    // Negating all the booleans in the form logic is harder than expected and not worth
    // the time.
    res.data[0].contactChannels = this.mapDisabledToSendFeedback(res.data[0].contactChannels);

    return { data: res.data, message: 'success' };
  }

  @Post('/contactsettings')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(UpdateContactSettingsDto, 'body'))
  async newContactSettings(@Req() req: RequestWithUser, @Body() userData: UpdateContactSettingsDto): Promise<any> {
    const { contactChannels } = userData;

    // See comment in @Get() handler for why this is mapped
    const mappedContactChannels = this.mapSendFeedbackToDisabled(contactChannels);

    const { guid } = req.user;
    const { organizationId } = req?.session?.representing;
    const newContactSettings: NewContactSettings = {
      alias: 'My contact settings',
      partyId: organizationId,
      createdById: guid,
      contactChannels: mappedContactChannels,
    };
    const url = `contactsettings/1.0/settings`;
    const res = await this.apiService.post<any>({ url, data: newContactSettings });

    return { data: res.data, message: 'created' };
  }

  @Patch('/contactsettings')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(UpdateContactSettingsDto, 'body'))
  async editContactSettings(@Req() req: RequestWithUser, @Body() userData: UpdateContactSettingsDto): Promise<void> {
    const { contactChannels, id } = userData;

    // See comment in @Get() handler for why this is mapped
    const mappedContactChannels = this.mapSendFeedbackToDisabled(contactChannels);

    const editedContactSettings: UpdateContactSettings = { alias: 'My contact settings', contactChannels: mappedContactChannels };
    const url = `contactsettings/1.0/settings/${id}`;
    await this.apiService.patch<any>({ url, data: editedContactSettings });
  }
}
