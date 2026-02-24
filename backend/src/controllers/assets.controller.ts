import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { AddressAddressCategoryEnum, Attachment, Errand, Stakeholder, StakeholderTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import { User } from '@/interfaces/users.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { fileUploadOptions } from '@/utils/files/fileUploadOptions';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import { apiURL } from '@/utils/util';
import { Body, Controller, Get, Param, Post, Req, UploadedFiles, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface AttachmentOptions {
  category: string;
  note: string;
}

interface ParkingPermitRenewalBody {
  description?: string;
  circumstancesChanged?: string;
  date?: string;
  walkingAids?: string; // JSON string of string[]
}

interface CreateErrandOptions {
  caseType: string;
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
    const attachmentUrl = `${MUNICIPALITY_ID}/SBK_PARKING_PERMIT/errands/${errandId}/attachments`;

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
    const mockPartyId = 'cbfdcea3-72d9-40ee-ad9c-4472b6b37bd1';
    const citizenUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${partyId}`;
    const citizenRes = await this.apiService.get<CitizenExtended>({ url: citizenUrl }, user).catch(() => null);

    if (!citizenRes?.data) {
      throw new HttpException(500, 'Could not fetch citizen data');
    }

    const citizen = citizenRes.data;
    const address = citizen.addresses?.find(a => a.address);

    return {
      firstName: citizen.givenname,
      lastName: citizen.lastname,
      type: StakeholderTypeEnum.PERSON,
      roles: ['APPLICANT'],
      personId: mockPartyId,
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
    const url = `${MUNICIPALITY_ID}/SBK_PARKING_PERMIT/errands`;
    const errandRes = await this.apiService.post<Errand, Errand>({ url, baseURL, data }, req.user);

    if (options.files?.length > 0 && errandRes.data?.id && options.attachmentOptions) {
      await this.uploadAttachments(errandRes.data.id, options.files, options.attachmentOptions, req.user);
    }

    return { data: { success: true }, message: 'ok' };
  }

  private toClientAsset = (asset: Asset): Asset => {
    delete asset.partyId;
    delete asset.id;
    if (asset.status !== Status.ACTIVE) {
      throw new HttpException(404, 'Not found');
    }
    return asset;
  };

  private toClientAssets = (assets: Asset[]): Asset[] => {
    return assets.map(this.toClientAsset).filter(asset => asset.status === Status.ACTIVE);
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
      caseType: 'PARKING_PERMIT_RENEWAL',
      extraParameters: extraParameters.length > 0 ? extraParameters : undefined,
      files,
      attachmentOptions: {
        category: 'MEDICAL_CONFIRMATION',
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
      caseType: 'LOST_PARKING_PERMIT',
      extraParameters: [
        {
          key: 'application.lostPermit.policeReportNumber',
          values: [body.policeReportNumber || ''],
        },
      ],
      files,
      attachmentOptions: {
        category: 'POLICE_REPORT',
        note: 'Polisanmälan för borttappat parkeringstillstånd',
      },
    });
  }
}
