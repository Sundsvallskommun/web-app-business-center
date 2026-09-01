import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { AddressAddressCategoryEnum, Errand, Stakeholder, StakeholderTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { Asset } from '@/data-contracts/partyassets/data-contracts';
import { AssetWithService } from '@/interfaces/asset.interface';
import { AttachmentCategory, CaseDataNamespace, ParkingPermitCaseType, StakeholderRole } from '@/interfaces/casedata.interface';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import { RepresentingMode } from '@/interfaces/representing.interface';
import { User } from '@/interfaces/users.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { findSourceErrandForAsset } from '@/services/asset-relations.service';
import {
  buildRenewalExtraParameters,
  buildRenewalPrefill,
  isAllowedAsset,
  isParkingPermitAsset,
  isVisibleStatus,
  ParkingPermitRenewalBody,
  ParkingPermitRenewalPrefill,
  toClientAsset,
  toServiceDetails,
  toVisibleAssets,
} from '@/services/asset.service';
import { fetchErrandById } from '@/services/casedata-errand.service';
import { toAttachmentMetadata, uploadErrandAttachment } from '@/services/casedata-attachment.service';
import { getCitizen } from '@/services/citizen.service';
import { buildMyPagesErrand } from '@/utils/casedata-errand-utils';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { getRepresentedPartyId } from '@/utils/getRepresentedPartyId';
import { logger } from '@/utils/logger';
import { apiURL, isSameUuid } from '@/utils/util';
import { AssetsApiResponse, ParkingPermitRenewalPrefillApiResponse } from '@/responses/asset.response';
import { Body, Controller, Get, Param, Post, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

interface AttachmentOptions {
  category: AttachmentCategory;
  note: string;
}

interface CreateErrandOptions {
  caseType: ParkingPermitCaseType;
  extraParameters?: Errand['extraParameters'];
  files?: Express.Multer.File[];
  attachmentOptions?: AttachmentOptions;
}

@Controller()
@UseBefore(authMiddleware)
export class AssetsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('partyassets');
  private casedataApiBase = getApiBase('case-data');

  /**
   * Resolve the partyId of the entity the caller represents.
   *
   * Every ownership check in this controller must be made against this one value, so that the
   * asset gate and the errand gate cannot end up judging against different parties.
   *
   * @param req Request object holding the session and the logged in user
   * @returns the represented partyId
   * @throws `HttpException` 400 when no party can be resolved from the session
   */
  private getPartyId(req: RequestWithUser): string {
    const { representing } = req.session ?? {};

    const partyId = getRepresentedPartyId(representing, req.user);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    return partyId;
  }

  private async uploadAttachments(errandId: number, files: Express.Multer.File[], options: AttachmentOptions, user: User): Promise<void> {
    // Uploaded one at a time: CaseData version locks the errand, so parallel posts to the
    // same errand risk losing an attachment to a locking conflict. These forms carry one
    // or two files, so the ordering costs nothing.
    for (const file of files) {
      try {
        await uploadErrandAttachment(CaseDataNamespace.SBK_PARKING_PERMIT, errandId, file, toAttachmentMetadata(file, options), user);
      } catch (error) {
        // The errand itself is already created at this point, so log enough for support
        // to be able to add the attachment manually.
        logger.error(`Failed to upload attachment ${file.originalname} to errand ${errandId}`);
        throw error;
      }
    }
  }

  private async getApplicantStakeholder(partyId: string, user: User): Promise<Stakeholder> {
    // const citizenUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}`;
    // const citizenRes = await this.apiService.get<CitizenExtended>({ url: citizenUrl }, user).catch(() => null);

    // if (!citizenRes?.data) {
    //   throw new HttpException(500, 'Could not fetch citizen data');
    // }

    // const citizen = citizenRes.data;
    const citizen = await getCitizen(partyId, { user });
    const address = citizen.addresses?.find(a => a.address);

    return {
      firstName: citizen.givenname ?? '',
      lastName: citizen.lastname ?? '',
      type: StakeholderTypeEnum.PERSON,
      roles: [StakeholderRole.APPLICANT],
      personId: partyId,
      addresses: [
        {
          addressCategory: AddressAddressCategoryEnum.POSTAL_ADDRESS,
          street: address?.address ?? '',
          houseNumber: address?.addressNumber ?? '',
          postalCode: address?.postalCode ?? '',
          city: address?.city ?? '',
          country: address?.country ?? '',
          careOf: address?.co ?? '',
          apartmentNumber: address?.appartmentNumber ?? '',
        },
      ],
    };
  }

  private async createParkingPermitErrand(req: RequestWithUser, options: CreateErrandOptions): Promise<ApiResponse<{ success: boolean }>> {
    const { representing } = req.session ?? {};

    // A parking permit is always applied for by the citizen themselves: the applicant
    // stakeholder is a PERSON, so an organization partyId must never reach personId.
    if (representing?.mode !== RepresentingMode.PRIVATE) {
      throw new HttpException(400, 'Missing party-id');
    }

    const partyId = getRepresentedPartyId(representing, req.user);

    if (!partyId) {
      throw new HttpException(400, 'Missing party-id');
    }

    const stakeholder = await this.getApplicantStakeholder(partyId, req.user);

    const data = buildMyPagesErrand({
      caseType: options.caseType,
      status: {
        statusType: 'Ärende inkommit',
      },
      stakeholders: [stakeholder],
      extraParameters: options.extraParameters,
    });

    const baseURL = apiURL(this.casedataApiBase);
    const url = `${MUNICIPALITY_ID}/${CaseDataNamespace.SBK_PARKING_PERMIT}/errands`;
    const errandRes = await this.apiService.post<Errand, Errand>({ url, baseURL, data }, req.user);

    if (options.files && options.files.length > 0 && errandRes.data?.id && options.attachmentOptions) {
      await this.uploadAttachments(errandRes.data.id, options.files, options.attachmentOptions, req.user);
    }

    return { data: { success: true }, message: 'ok' };
  }

  @Get('/assets')
  @OpenAPI({ summary: 'Return a list of assets for current representing entity' })
  @ResponseSchema(AssetsApiResponse)
  async getAssets(@Req() req: RequestWithUser): Promise<ApiResponse<AssetWithService[]>> {
    const partyId = this.getPartyId(req);

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      const params = { partyId };
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/assets`;
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req.user);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      const assets = toVisibleAssets(res.data);
      const data = await Promise.all(assets.map(async asset => ({ ...toClientAsset(asset), service: await toServiceDetails(asset, req.user) })));

      return { data, message: 'success' };
    } catch (error) {
      if (error instanceof HttpException && error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        throw new HttpException(500, 'Something went wrong');
      }
    }
  }

  /**
   * Validate that an asset is among the assets the user actually owns
   *
   * The user's partyId is extracted from the session, and this partyId
   * is then used for filtering the /assets endpoint in PartyAssets. The
   * list of assets is then filtered by the asset id parameter. The asset
   * is only returned if it is found, is of a whitelisted type, has an
   * allowed status and has a partyId matching the request user's partyId
   *
   * This is the single point where asset ownership is decided: every
   * endpoint that resolves an asset by id must go through this rather
   * than fetching it directly.
   *
   * @param req Request object containing user to search assets for
   * @param id Id of the asset to locate
   * @returns the matching asset as returned by PartyAssets
   * @throws `HttpException` 400 when no partyId can be resolved from the
   * session, or no asset id was given
   * @throws `HttpException` 404 when the asset is not among the user's
   * assets, is not a whitelisted type, or has a hidden status
   * @throws `HttpException` 500 on any other failure from PartyAssets
   */
  private async findOwnedAsset(req: RequestWithUser, id: string): Promise<Asset> {
    const partyId = this.getPartyId(req);

    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      const params = { partyId };
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/assets`;
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req.user);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      const asset = res.data.find(a => a.id === id && isSameUuid(a.partyId, partyId));

      if (!asset || !isAllowedAsset(asset) || !isVisibleStatus(asset)) {
        throw new HttpException(404, 'Asset not found');
      }

      return asset;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException && error.status === 404) {
        throw new HttpException(404, 'Asset not found');
      }
      throw new HttpException(500, 'Something went wrong');
    }
  }

  @Get('/assets/:id')
  @OpenAPI({ summary: 'Return a asset' })
  async getAsset(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<AssetWithService>> {
    const asset = await this.findOwnedAsset(req, id);
    const service = await toServiceDetails(asset, req.user);

    return { data: { ...toClientAsset(asset), service }, message: 'success' };
  }

  @Get('/assets/:id/renewal-prefill')
  @OpenAPI({ summary: 'Return renewal form values taken from the errand the permit was issued from' })
  @ResponseSchema(ParkingPermitRenewalPrefillApiResponse)
  async getParkingPermitRenewalPrefill(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<ParkingPermitRenewalPrefill>> {
    // Ownership is settled first: everything after this walks a chain of ids that would
    // otherwise let a guessed asset id pull back someone else's errand.
    const asset = await this.findOwnedAsset(req, id);

    if (!asset?.id || !isParkingPermitAsset(asset)) {
      throw new HttpException(404, 'Asset not found');
    }

    const sourceErrand = await findSourceErrandForAsset(asset.id, req.user);
    if (!sourceErrand) {
      return { data: { expirationDate: asset.validTo }, message: 'no source errand' };
    }

    const errand = await fetchErrandById(sourceErrand.id, sourceErrand.namespace, this.getPartyId(req), req.user);
    if (!errand) {
      return { data: { expirationDate: asset.validTo }, message: 'source errand unavailable' };
    }

    return { data: buildRenewalPrefill(errand, asset.validTo), message: 'success' };
  }

  @Post('/assets/parkingpermit/extend')
  @OpenAPI({ summary: 'Extend parking permit' })
  async extendParkingPermit(
    @Req() req: RequestWithUser,
    @Body() body: ParkingPermitRenewalBody,
    @UploadedFiles('files', { options: fileUploadOptions, required: false }) files: Express.Multer.File[],
  ): Promise<ApiResponse<{ success: boolean }>> {
    const extraParameters = buildRenewalExtraParameters(body);

    return this.createParkingPermitErrand(req, {
      caseType: ParkingPermitCaseType.RENEWAL,
      extraParameters: extraParameters.length > 0 ? extraParameters : undefined,
      files,
      attachmentOptions: {
        category: AttachmentCategory.MEDICAL_CONFIRMATION,
        note: 'Läkarintyg för parkeringstillstånd',
      },
    });
  }

  @Post('/assets/parkingpermit/lost')
  @OpenAPI({ summary: 'Report lost parking permit' })
  async reportLostParkingPermit(
    @Req() req: RequestWithUser,
    @Body() body: { policeReportNumber: string },
    @UploadedFiles('files', { options: fileUploadOptions, required: false }) files: Express.Multer.File[],
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.createParkingPermitErrand(req, {
      caseType: ParkingPermitCaseType.LOST,
      extraParameters: [
        {
          key: 'application.lostPermit.policeReportNumber',
          values: [body.policeReportNumber || ''],
        },
      ],
      files,
      attachmentOptions: {
        category: AttachmentCategory.POLICE_REPORT,
        note: 'Polisanmälan för borttappat parkeringstillstånd',
      },
    });
  }
}
