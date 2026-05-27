import { MUNICIPALITY_ID, WHITELIST_ASSET_TYPES } from '@/config';
import { getApiBase } from '@/config/api-config';
import { AddressAddressCategoryEnum, Attachment, Errand, Stakeholder, StakeholderTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import { AttachmentCategory, CaseDataNamespace, ParkingPermitCaseType, StakeholderRole } from '@/interfaces/casedata.interface';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import { User } from '@/interfaces/users.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { getCitizen } from '@/services/citizen.service';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import { apiURL } from '@/utils/util';
import { Body, Controller, Get, Param, Post, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface AttachmentOptions {
  category: AttachmentCategory;
  note: string;
}

interface ParkingPermitRenewalBody {
  description?: string;
  circumstancesChanged?: string;
  date?: string;
  walkingAids?: string; // JSON string of string[]
}

interface CreateErrandOptions {
  caseType: ParkingPermitCaseType;
  extraParameters?: Errand['extraParameters'];
  files?: Express.Multer.File[];
  attachmentOptions?: AttachmentOptions;
}

@Controller()
export class AssetsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('partyassets');
  private casedataApiBase = getApiBase('case-data');
  private citizenApiBase = getApiBase('citizen');

  private async uploadAttachments(errandId: number, files: Express.Multer.File[], options: AttachmentOptions, user: User): Promise<void> {
    const baseURL = apiURL(this.casedataApiBase);
    const attachmentUrl = `${MUNICIPALITY_ID}/${CaseDataNamespace.SBK_PARKING_PERMIT}/errands/${errandId}/attachments`;

    await Promise.all(
      files.map(file => {
        const fileExtension = file.originalname.split('.').pop() || '';
        const attachmentData: Attachment = {
          category: options.category,
          name: file.originalname,
          extension: fileExtension,
          mimeType: file.mimetype,
          file: file.buffer.toString('base64'),
          note: options.note,
        };
        return this.apiService.post<Attachment, Attachment>({ url: attachmentUrl, baseURL, data: attachmentData }, user);
      }),
    );
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

    if (!representing?.PRIVATE?.partyId) {
      throw new HttpException(400, 'Missing party-id');
    }

    const stakeholder = await this.getApplicantStakeholder(representing.PRIVATE.partyId, req.user);

    const data: Errand = {
      caseType: options.caseType,
      status: {
        statusType: 'Ärende inkommit',
      },
      stakeholders: [stakeholder],
      extraParameters: options.extraParameters,
    };

    const baseURL = apiURL(this.casedataApiBase);
    const url = `${MUNICIPALITY_ID}/${CaseDataNamespace.SBK_PARKING_PERMIT}/errands`;
    const errandRes = await this.apiService.post<Errand, Errand>({ url, baseURL, data }, req.user);

    if (options.files?.length > 0 && errandRes.data?.id && options.attachmentOptions) {
      await this.uploadAttachments(errandRes.data.id, options.files, options.attachmentOptions, req.user);
    }

    return { data: { success: true }, message: 'ok' };
  }

  // Whitelist of asset types from env (WHITELIST_ASSET_TYPES). Types not listed
  // (e.g. LICENSE) are never returned over the network.
  private isAllowedAsset = (asset: Asset): boolean => {
    return !!asset?.type && WHITELIST_ASSET_TYPES.includes(asset.type);
  };

  // Statuses tied to ongoing or superseded cases. DRAFT belongs to active
  // errands and REPLACED has been superseded by a newer asset, so neither is
  // shown to citizens. ACTIVE/EXPIRED/BLOCKED/TEMPORARY are all returned.
  private static readonly HIDDEN_STATUSES: ReadonlySet<Status> = new Set([Status.DRAFT, Status.REPLACED]);

  private isVisibleStatus = (asset: Asset): boolean => {
    return !!asset?.status && !AssetsController.HIDDEN_STATUSES.has(asset.status);
  };

  // The external assetId is the only client-facing identifier (the internal id
  // is stripped below), so an asset without one cannot be opened in detail.
  // Skip it rather than list a card that links to /assets/undefined.
  private isAddressable = (asset: Asset): boolean => {
    return !!asset?.assetId;
  };

  // Strip server-only fields without mutating the upstream API objects.
  private toClientAsset = (asset: Asset): Asset => {
    const clientAsset = { ...asset };
    delete clientAsset.partyId;
    delete clientAsset.id;
    return clientAsset;
  };

  private toClientAssets = (assets: Asset[]): Asset[] => {
    return assets.filter(this.isAllowedAsset).filter(this.isVisibleStatus).filter(this.isAddressable).map(this.toClientAsset);
  };

  @Get('/assets')
  @OpenAPI({ summary: 'Return a list of assets for current representing entity' })
  @UseBefore(authMiddleware)
  async getAssets(@Req() req: RequestWithUser): Promise<ApiResponse<Asset[]>> {
    const { representing } = req.session ?? {};

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      const params = {
        partyId: getRepresentingPartyId(representing),
      };
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/assets`;
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req.user);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      return { data: this.toClientAssets(res.data), message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        throw new HttpException(500, 'Something went wrong');
      }
    }
  }

  @Get('/assets/:assetId')
  @OpenAPI({ summary: 'Return a asset' })
  @UseBefore(authMiddleware)
  async getAsset(@Req() req: RequestWithUser, @Param('assetId') assetId: string): Promise<ApiResponse<Asset>> {
    const { representing } = req.session ?? {};

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    if (!assetId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const params = {
        partyId: getRepresentingPartyId(representing),
        assetId,
      };
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/assets`;
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req.user);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      if (res.data.length === 0) {
        throw new HttpException(404, 'Asset not found');
      }

      if (!this.isAllowedAsset(res.data[0]) || !this.isVisibleStatus(res.data[0])) {
        throw new HttpException(404, 'Asset not found');
      }

      return { data: this.toClientAsset(res.data[0]), message: 'success' };
    } catch (error) {
      console.error(error);
      if (error.status === 404) {
        throw new HttpException(404, 'Asset not found');
      }
      throw new HttpException(500, 'Something went wrong');
    }
  }

  @Post('/assets/parkingpermit/extend')
  @OpenAPI({ summary: 'Extend parking permit' })
  @UseBefore(authMiddleware)
  async extendParkingPermit(
    @Req() req: RequestWithUser,
    @Body() body: ParkingPermitRenewalBody,
    @UploadedFiles('files', { options: fileUploadOptions, required: false }) files: Express.Multer.File[],
  ): Promise<ApiResponse<{ success: boolean }>> {
    const extraParameters: Errand['extraParameters'] = [];

    extraParameters.push({
      key: 'application.reason',
      values: [body.description ?? ''],
    });

    if (body.walkingAids) {
      try {
        const walkingAidsArray: string[] = JSON.parse(body.walkingAids);
        if (Array.isArray(walkingAidsArray) && walkingAidsArray.length > 0) {
          extraParameters.push({
            key: 'disability.aid',
            values: walkingAidsArray,
          });
        }
      } catch {
        // Invalid JSON, skip walkingAids
      }
    }

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
  @UseBefore(authMiddleware)
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
