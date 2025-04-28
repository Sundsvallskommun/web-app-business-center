import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class AssetsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('partyassets');

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
    const { representing } = req?.session;

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
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req);

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
    const { representing } = req?.session;

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
      const res = await this.apiService.get<Asset[]>({ url, signal, params }, req);

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
}
