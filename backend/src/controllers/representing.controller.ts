import { Body, Controller, Get, Post, Req, UseBefore } from 'routing-controllers';
import authMiddleware from '@middlewares/auth.middleware';
import { HttpException } from '@exceptions/HttpException';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { RepresentsDto } from '@dtos/represents.dto';
import { formatOrgNr } from '@utils/util';
import { BusinessEngagementController } from './business-engagement.controller';
import { BusinessInformation } from '@/interfaces/business-engagement';
import { RepresentingEntity } from '@/types/express-session';

interface ResponseData {
  data: any;
  message: string;
}

@Controller()
export class RepresentingController {
  @Get('/representing')
  @OpenAPI({ summary: 'Return which entity a logged in user represents' })
  @UseBefore(authMiddleware)
  async getBussinesEngagments(@Req() req: RequestWithUser): Promise<ResponseData> {
    const { representing } = req?.session;

    if (!representing) {
      throw new HttpException(403, 'Forbidden');
    }

    const representingToSend: RepresentingEntity = {
      organizationId: representing.organizationId,
      organizationName: representing.organizationName,
      organizationNumber: representing.organizationNumber,
      information: representing.information,
    };

    return { data: representingToSend, message: 'success' };
  }

  @Post('/representing')
  @UseBefore(validationMiddleware(RepresentsDto, 'body'))
  @OpenAPI({ summary: 'Sets which entity a logged in user represents' })
  @UseBefore(authMiddleware)
  async postBusinessEngagements(@Body() selectedRepresenting: RepresentsDto, @Req() req: RequestWithUser): Promise<ResponseData> {
    const { representingChoices } = req?.session;

    if (!representingChoices) {
      throw new HttpException(400, 'Bad Request - No choices');
    }

    const selected = representingChoices.find(rc => rc.organizationNumber === selectedRepresenting.organizationNumber);

    if (!selected) {
      throw new HttpException(400, 'Bad Request - Does not exists');
    }

    if (!selected.organizationId || !selected.organizationName || !selected.organizationNumber) {
      throw new HttpException(500, 'Internal Server Error - Data not complete');
    }

    // Fetch businessinformation to add to representingEntity
    const businessController = new BusinessEngagementController();
    const businessInformationRes = await businessController.businessInformation(req, selected);
    let businessInformation: BusinessInformation = {};
    if (businessInformationRes.data?.information) {
      businessInformation = businessInformationRes.data.information;
    }

    // FIXME: LegaLEntity returns a GUID as an escaped string.
    const fixedGuid = selected?.organizationId?.replace(/[^a-zA-Z0-9-]/g, '');

    req.session.representing = {
      organizationName: selected.organizationName,
      organizationId: fixedGuid,
      organizationNumber: formatOrgNr(selected.organizationNumber),
      information: businessInformation,
    };

    const representingToSend: RepresentingEntity = {
      organizationId: selected.organizationId,
      organizationName: selected.organizationName,
      organizationNumber: selected.organizationNumber,
      information: businessInformation,
    };

    return { data: representingToSend, message: 'success' };
  }
}
