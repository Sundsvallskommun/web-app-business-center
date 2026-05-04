import { Errand, Stakeholder } from '@/data-contracts/caremanagement/data-contracts';
import { EconomicAidApplicationDto } from '@/dtos/economic-aid.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  EconomicAidApplicationV1,
  SubmitApplicationResponse,
} from '@/interfaces/economic-aid.interface';
import { ApiResponse } from '@/interfaces/service';
import { validateRequestBody } from '@/utils/validate';
import authMiddleware from '@middlewares/auth.middleware';
import { logger } from '@utils/logger';
import { Body, Controller, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

const NAMESPACE = 'IFO_EKONOMISKT_BISTAND';

const buildApplicantStakeholder = (req: RequestWithUser): Stakeholder => ({
  role: 'APPLICANT',
  externalId: req.user.partyId,
  externalIdType: 'PRIVATE',
  firstName: req.user.givenName,
  lastName: req.user.surname,
});

/**
 * Maps the typed application document to a careManagement Errand.
 *
 * The full application is stored as a single JSON parameter on the
 * errand (`applicationDocument`) together with its `applicationSchemaVersion`.
 * Selected workflow signals are denormalized into separate parameters
 * so handläggar-vyer and BPMN/DMN rules can read them without parsing
 * the document. Add to the denormalized list as the form grows — never
 * read business-critical values from the JSON blob alone.
 */
export const applicationToErrand = (data: EconomicAidApplicationV1, req: RequestWithUser): Errand => ({
  namespace: NAMESPACE,
  title: 'Ansökan om ekonomiskt bistånd',
  category: 'ECONOMIC_AID',
  type: 'APPLICATION',
  status: 'NEW',
  reporterUserId: req.user.partyId,
  stakeholders: [buildApplicantStakeholder(req)],
  externalTags: [{ key: 'submittedFromMyPages', value: 'true' }],
  parameters: [
    {
      key: 'applicationSchemaVersion',
      displayName: 'Schemaversion',
      parameterGroup: 'application',
      values: [data.schemaVersion],
    },
    {
      key: 'applicationKind',
      displayName: 'Ansökningstyp',
      parameterGroup: 'application',
      values: [data.vagval.kind ?? ''],
    },
    {
      key: 'applicationDocument',
      displayName: 'Ansökningsdokument (JSON)',
      parameterGroup: 'application',
      values: [JSON.stringify(data)],
    },
  ],
});

@Controller()
export class EconomicAidController {
  @Post('/economic-aid/applications')
  @OpenAPI({ summary: 'Submit an economic aid application' })
  @UseBefore(authMiddleware)
  async submit(
    @Req() req: RequestWithUser,
    @Body() body: EconomicAidApplicationV1,
  ): Promise<ApiResponse<SubmitApplicationResponse>> {
    // routing-controllers does not auto-validate when @Body is typed as an
    // interface, so we run the DTO check here explicitly. Mirrors the pattern
    // used in case.controller.ts (newCaseMessage).
    await validateRequestBody(EconomicAidApplicationDto, body);

    if (!req.user?.partyId) {
      throw new HttpException(401, 'Unauthorized');
    }

    const errand = applicationToErrand(body, req);

    // FIXME: ersätt detta med ett riktigt POST mot caremanagement-/{municipalityId}/{namespace}/errands
    // när IFO-namespacet är registrerat och authn-policyn för Mina sidor → caremanagement är på plats.
    // Tills dess loggar vi payloaden för utveckling/granskning och returnerar en stub-id.
    logger.info(`[economic-aid] would submit errand for partyId=${req.user.partyId} kind=${body.vagval.kind}`);
    logger.debug(`[economic-aid] errand payload: ${JSON.stringify(errand)}`);

    return {
      data: { errandId: `stub-${Date.now()}` },
      message: 'success',
    };
  }
}
