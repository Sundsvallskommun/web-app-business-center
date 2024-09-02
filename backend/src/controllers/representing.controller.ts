import { BusinessInformation } from '@/interfaces/business-engagement';
import { RepresentsDto } from '@dtos/represents.dto';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { Body, Controller, Get, Param, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RepresentingEntity, RepresentingEntityClient, RepresentingMode } from '../interfaces/representing.interface';
import { BusinessEngagementController } from './business-engagement.controller';

interface ResponseData {
  data: any;
  message: string;
}

type IntersectByProperties<T, U> = Pick<T & U, Extract<keyof T, keyof U>>;

@Controller()
export class RepresentingController {
  getBusinessInformation = async (req, selected) => {
    const businessController = new BusinessEngagementController();
    const businessInformationRes = await businessController.businessInformation(req, selected);
    let businessInformation: BusinessInformation = {};
    if (businessInformationRes.data?.information) {
      businessInformation = businessInformationRes.data.information;
    }
    return businessInformation;
  };

  getSelected = <TSelected extends Record<keyof IntersectByProperties<TSelected, RepresentsDto>, unknown>>(
    choices: TSelected[],
    selectedRepresenting: RepresentsDto,
    matchKey: keyof IntersectByProperties<TSelected, RepresentsDto>,
  ): TSelected => {
    if (!choices) {
      throw new HttpException(400, 'Bad Request - No choices');
    }
    const selected = choices.find(rc => rc[matchKey] === selectedRepresenting[matchKey]);

    if (!selected) {
      throw new HttpException(400, 'Bad Request - Does not exists');
    }
    return selected;
  };

  fixGuid = guid => guid?.replace(/[^a-zA-Z0-9-]/g, '');

  getDefaultPRIVATE = (req: RequestWithUser) => ({
    partyId: this.fixGuid(req.user.partyId),
    personNumber: req.user.personNumber,
    name: req.user.name,
  });

  getDefaultBUSINESS = async (req: RequestWithUser) => {
    const { representingBusinessChoices } = req?.session;
    const selected = this.getSelected(representingBusinessChoices, req.body, 'organizationNumber');
    const businessInformation = await this.getBusinessInformation(req, selected);

    return {
      partyId: this.fixGuid(selected.organizationId),
      organizationName: selected.organizationName,
      organizationNumber: selected.organizationNumber,
      information: businessInformation,
    };
  };

  getRepresentingToSend: (representing: RepresentingEntity) => RepresentingEntityClient = newRepresenting => ({
    BUSINESS: newRepresenting?.BUSINESS
      ? {
          organizationName: newRepresenting?.BUSINESS?.organizationName,
          organizationNumber: newRepresenting?.BUSINESS?.organizationNumber,
          information: newRepresenting?.BUSINESS?.information,
        }
      : undefined,
    PRIVATE: newRepresenting.PRIVATE
      ? {
          name: newRepresenting?.PRIVATE?.name,
        }
      : undefined,
    mode: newRepresenting?.mode,
  });

  @Get('/representing')
  @OpenAPI({ summary: 'Return which entity a logged in user represents' })
  @UseBefore(authMiddleware)
  async getBussinesEngagments(@Req() req: RequestWithUser): Promise<ResponseData> {
    const { representing } = req?.session;

    if (!representing) {
      throw new HttpException(403, 'Forbidden');
    }

    if (!representing.PRIVATE) {
      req.session.representing.PRIVATE = this.getDefaultPRIVATE(req);
    }

    return { data: this.getRepresentingToSend(req.session.representing), message: 'success' };
  }

  @Post('/representing')
  @UseBefore(validationMiddleware(RepresentsDto, 'body'))
  @OpenAPI({ summary: 'Sets which entity a logged in user represents' })
  @UseBefore(authMiddleware)
  async postBusinessEngagements(@Body() selectedRepresenting: RepresentsDto, @Req() req: RequestWithUser): Promise<ResponseData> {
    const { representing } = req?.session;
    let newRepresenting = representing;

    if (selectedRepresenting.organizationNumber !== undefined) {
      // const { representingBusinessChoices } = req?.session;
      // const selected = this.getSelected(representingBusinessChoices, selectedRepresenting, 'organizationNumber');
      // const businessInformation = await this.getBusinessInformation(req, selected);

      const data: RepresentingEntity = {
        BUSINESS: await this.getDefaultBUSINESS(req),
        PRIVATE: newRepresenting?.PRIVATE,
        mode: newRepresenting?.mode,
      };
      newRepresenting = data;
    }
    if (
      selectedRepresenting.personNumber !== undefined ||
      selectedRepresenting.mode === RepresentingMode.PRIVATE ||
      selectedRepresenting.mode === undefined
    ) {
      const data: RepresentingEntity = {
        BUSINESS: newRepresenting?.BUSINESS,
        PRIVATE: this.getDefaultPRIVATE(req),
        mode: newRepresenting?.mode,
      };
      newRepresenting = data;
    }
    if (selectedRepresenting.mode !== undefined) {
      const data: RepresentingEntity = {
        BUSINESS: newRepresenting?.BUSINESS,
        PRIVATE: newRepresenting?.PRIVATE,
        mode: selectedRepresenting.mode,
      };
      newRepresenting = data;
    }

    req.session.representing = newRepresenting;

    return { data: this.getRepresentingToSend(newRepresenting), message: 'success' };
  }
}
