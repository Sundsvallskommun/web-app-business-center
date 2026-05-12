import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { RepresentsDto } from '@dtos/represents.dto';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { getIsWhitelisted } from '@/services/mandate.service';
import { logger } from '@/utils/logger';
import { Body, Controller, Get, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RepresentingBusinessEntity, RepresentingEntity, RepresentingEntityClient, RepresentingMode } from '../interfaces/representing.interface';
import { Engagement, LegalEntityController } from './legal-entity.controller';

interface ResponseData {
  data: any;
  message: string;
}

type IntersectByProperties<T, U> = Pick<T & U, Extract<keyof T, keyof U>>;

@Controller()
export class RepresentingController {
  private legalEntityController = new LegalEntityController();

  getBusinessInformation = async (guid: string, user: RequestWithUser['user']): Promise<ClientBusinessInformation> => {
    const legalEntity = await this.legalEntityController.getLegalEntity(guid, user);
    const address = legalEntity?.postAddress;
    let businessInformation: ClientBusinessInformation = {};
    if (legalEntity) {
      businessInformation = {
        companyLocation: {
          city: address?.city ?? '',
          street: address?.address1 ?? '',
          postcode: address?.postalCode ?? '',
          careOf: address?.coAdress ?? '',
        },
      };
    }
    return businessInformation;
  };

  getSelected = <TSelected extends Record<string, any>, MatchKey extends keyof IntersectByProperties<TSelected, RepresentsDto>>(
    choices: TSelected[],
    selectedRepresenting: RepresentsDto,
    matchKey: MatchKey,
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

  getDefaultBUSINESS = async (req: RequestWithUser): Promise<RepresentingBusinessEntity> => {
    const { representingBusinessChoices } = req?.session;
    const selected = this.getSelected<Engagement, 'organizationNumber'>(representingBusinessChoices, req.body, 'organizationNumber');
    const guid = await this.legalEntityController.getGuid(selected.organizationNumber, req.user);
    const businessInformation = await this.getBusinessInformation(guid, req.user);
    const partyId = this.fixGuid(guid);

    let whitelisted = false;
    try {
      whitelisted = await getIsWhitelisted(req.user, partyId);
    } catch (error) {
      logger.error('Error checking whitelisted status', error);
    }

    return {
      partyId,
      organizationName: selected.organizationName,
      organizationNumber: selected.organizationNumber,
      isAuthorizedSignatory: selected.isAuthorizedSignatory ?? false,
      whitelisted,
      information: businessInformation,
    };
  };

  getRepresentingToSend: (representing: RepresentingEntity) => RepresentingEntityClient = newRepresenting => ({
    BUSINESS: newRepresenting?.BUSINESS
      ? {
          organizationName: newRepresenting?.BUSINESS?.organizationName,
          organizationNumber: newRepresenting?.BUSINESS?.organizationNumber,
          isAuthorizedSignatory: newRepresenting?.BUSINESS?.isAuthorizedSignatory,
          whitelisted: newRepresenting?.BUSINESS?.whitelisted,
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

    if (representing.mode === RepresentingMode.BUSINESS && !representing.BUSINESS) {
      throw new HttpException(400, 'Representing not set');
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
