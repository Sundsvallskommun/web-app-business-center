import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import _ from 'lodash';
import { Body, Controller, Get, HttpCode, OnUndefined, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '../config';
import { ContactSetting, ContactSettingChannel, NewContactSettings, UpdateContactSettings } from '../interfaces/contact-settings';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ResponseData } from '../interfaces/service';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { ClientContactSetting } from '../responses/contactsettings.response';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';
import { getBusinessAddress, getBusinessName, getEmailSettingsFromChannels, getPhoneSettingsFromChannels } from './contact-settings/utils';

@Controller()
export class ContactSettingsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('contactsettings');

  getContactSettingChannels = (userData: ClientContactSetting) => {
    const emailSettings: ContactSettingChannel = {
      contactMethod: 'EMAIL',
      destination: userData.email,
      disabled: userData.notifications.email_disabled,
      alias: 'default',
    };
    const phoneSettings: ContactSettingChannel = {
      contactMethod: 'SMS',
      destination: userData.phone,
      disabled: userData.notifications.phone_disabled,
      alias: 'default',
    };
    return [...(userData.email ? [emailSettings] : []), ...(userData.phone ? [phoneSettings] : [])];
  };

  @Get('/contactsettings')
  @OpenAPI({ summary: 'Return a list of contact settings' })
  @ResponseSchema(ClientContactSetting)
  @UseBefore(authMiddleware)
  async cases(
    @Req() req: RequestWithUser,
    @QueryParam('limit', { required: false }) limit?: number,
    @QueryParam('page', { required: false }) page?: number,
  ): Promise<ResponseData<ClientContactSetting>> {
    const { representing } = req?.session;
    const { user } = req;

    if (!getRepresentingPartyId(representing)) {
      throw new HttpException(403, 'Forbidden');
    }

    // FIXME: we probably want to go thru all pages?
    //        or do we want to have a load more button in UI?
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings`;
    const params = {
      partyId: getRepresentingPartyId(representing),
      page: page ?? 1,
      limit: limit ?? 100, // NOTE: 100 is max it seems
    };

    let res;
    try {
      res = await this.apiService.get<Array<ContactSetting>>({ url, params }, req);
    } catch (err) {
      // 404 for no data
      if (err.status !== 404) {
        throw err;
      }
    }

    const apiData = res?.data?.[0];

    const emailSettings = getEmailSettingsFromChannels(apiData.contactChannels);
    const phoneSettings = getPhoneSettingsFromChannels(apiData.contactChannels);

    const data: ClientContactSetting = {
      id: apiData.id,
      name: null,
      address: null,
      email: emailSettings.email,
      phone: phoneSettings.phone,
      notifications: {
        email_disabled: emailSettings.email_disabled,
        phone_disabled: phoneSettings.phone_disabled,
      },
      decicionsAndDocuments: {
        digitalInbox: true,
        myPages: true,
        snailmail: false,
      },
    };
    switch (representing.mode) {
      case RepresentingMode.BUSINESS:
        data.name = getBusinessName(representing);
        data.address = getBusinessAddress(representing);
        break;
      case RepresentingMode.PRIVATE:
        data.name = user.name;
        const params = {
          ShowClassified: false,
        };
        res = await this.apiService.get<Array<ContactSetting>>({ url: `citizen/2.0/${user.partyId}`, params }, req);
        if (res.data) {
          const address = res.data.addresses?.[0];
          data.address = address?.city
            ? {
                city: address.city,
                street: !address.addressArea || !address.addressNumber ? undefined : `${address.addressArea} ${address.addressNumber}`,
                postcode: address.postalCode,
              }
            : null;
        }
        break;
      default:
      //
    }
    return { data: data, message: 'success' };
  }

  @Post('/contactsettings')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientContactSetting, 'body'))
  async newContactSettings(@Req() req: RequestWithUser, @Body() userData: ClientContactSetting): Promise<any> {
    const { representing } = req?.session;
    const newContactSettings: NewContactSettings = {
      alias: 'default',
      partyId: getRepresentingPartyId(representing),
      createdById: req.user.partyId,
      contactChannels: this.getContactSettingChannels(userData),
    };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings`;
    const res = await this.apiService.post<any>({ url, data: newContactSettings }, req);

    const data = _.merge(userData, {
      id: res.data?.id,
    });

    return { data: data, message: 'created' };
  }

  @Patch('/contactsettings')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientContactSetting, 'body'))
  async editContactSettings(@Req() req: RequestWithUser, @Body() userData: ClientContactSetting): Promise<ResponseData<ClientContactSetting>> {
    if (!userData.id) {
      throw new HttpException(400, 'Bad Request');
    }
    const editedContactSettings: UpdateContactSettings = { alias: 'default', contactChannels: this.getContactSettingChannels(userData) };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${userData.id}`;
    const res = await this.apiService.patch<any>({ url, data: editedContactSettings }, req);

    const data = _.merge(userData, {
      id: res.data?.id,
    });

    return { data: data, message: 'updated' };
  }
}
