import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '../config';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ResponseData } from '../interfaces/service';
import { ClientContactSetting, ContactSetting } from '../responses/contactsettings.response';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';
import { getBusinessAddress, getBusinessName, getEmailSettingsFromChannels, getPhoneSettingsFromChannels } from './contact-settings/utils';

@Controller()
export class ContactSettingsController {
  private apiService = new ApiService();

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
    const url = `contactsettings/2.0/${MUNICIPALITY_ID}/settings`;
    const params = {
      partyId: getRepresentingPartyId(representing),
      page: page ?? 1,
      limit: limit ?? 100, // NOTE: 100 is max it seems
    };

    let res;
    try {
      res = await this.apiService.get<Array<ContactSetting>>({ url, params });
    } catch (err) {
      // 404 for no data
      if (err.status !== 404) {
        throw err;
      }
    }

    const emailSettings = getEmailSettingsFromChannels(res?.data?.[0]?.contactChannels);
    const phoneSettings = getPhoneSettingsFromChannels(res?.data?.[0]?.contactChannels);

    const data: ClientContactSetting = {
      name: null,
      address: null,
      email: emailSettings.email,
      phone: phoneSettings.phone,
      notifications: {
        email_disabled: emailSettings.email_disabled,
        phone_disabled: phoneSettings.phone_disabled,
      },
      decicionsAndDocuments: {
        digitalInbox: false,
        myPages: false,
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
        res = await this.apiService.get<Array<ContactSetting>>({ url: `citizen/2.0/${user.partyId}`, params });
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

  // @Post('/contactsettings')
  // @HttpCode(201)
  // @OpenAPI({ summary: 'Create contact settings for current logged in user' })
  // @UseBefore(authMiddleware, validationMiddleware(UpdateContactSettingsDto, 'body'))
  // async newContactSettings(@Req() req: RequestWithUser, @Body() userData: UpdateContactSettingsDto): Promise<any> {
  //   const { contactChannels } = userData;

  //   // See comment in @Get() handler for why this is mapped
  //   const mappedContactChannels = this.mapSendFeedbackToDisabled(contactChannels);

  //   const { partyId: userPartyId } = req.user;
  //   const { representing } = req?.session;
  //   const newContactSettings: NewContactSettings = {
  //     alias: 'My contact settings',
  //     partyId: getRepresentingPartyId(representing),
  //     createdById: userPartyId,
  //     contactChannels: mappedContactChannels,
  //   };
  //   const url = `contactsettings/1.0/settings`;
  //   const res = await this.apiService.post<any>({ url, data: newContactSettings });

  //   return { data: res.data, message: 'created' };
  // }

  // @Patch('/contactsettings')
  // @OnUndefined(204)
  // @OpenAPI({ summary: 'Update contact settings for current logged in user' })
  // @UseBefore(authMiddleware, validationMiddleware(UpdateContactSettingsDto, 'body'))
  // async editContactSettings(@Req() req: RequestWithUser, @Body() userData: UpdateContactSettingsDto): Promise<void> {
  //   const { contactChannels, id } = userData;

  //   // See comment in @Get() handler for why this is mapped
  //   const mappedContactChannels = this.mapSendFeedbackToDisabled(contactChannels);

  //   const editedContactSettings: UpdateContactSettings = { alias: 'My contact settings', contactChannels: mappedContactChannels };
  //   const url = `contactsettings/1.0/settings/${id}`;
  //   await this.apiService.patch<any>({ url, data: editedContactSettings });
  // }
}
