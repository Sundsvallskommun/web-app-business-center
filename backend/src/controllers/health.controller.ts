import { getApiBase } from '@/config/api-config';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class HealthController {
  private apiService = new ApiService();
  private apiBase = getApiBase('simulatorserver');

  @Get('/health/up')
  @OpenAPI({ summary: 'Return health check' })
  async up() {
    const url = `${this.apiBase}simulations/response?status=200%20OK`;
    const data = {
      status: 'OK',
    };
    const res = await this.apiService.post<{ status: string }>({ url, data }).catch(e => {
      logger.error('Error when doing health check:', e);
      return e;
    });

    return res.data;
  }
}
