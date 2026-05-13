import { GRP_ACCESS_TOKEN, GRP_URL } from '@/config';
import { logger } from '@utils/logger';
import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios';
import https from 'node:https';

const agent = new https.Agent();

class GrpApiService {
  private readonly instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({ httpsAgent: agent, baseURL: GRP_URL });
    this.instance.interceptors.request.use(
      async function (request) {
        request.headers['Content-Type'] = 'application/json';
        request.headers['Accept'] = '*/*';
        request.headers['Accept-Encoding'] = 'gzip, deflate';
        request.headers['accessToken'] = GRP_ACCESS_TOKEN;
        return request;
      },
      function (error) {
        return Promise.reject(new Error(error));
      },
    );
  }
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...config.headers },
      params: { ...config.params },
    };
    try {
      const result = await this.instance(preparedConfig);
      return result.data;
    } catch (error) {
      if (isAxiosError(error)) {
        logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
        logger.error(`Error details: ${JSON.stringify(error.response?.data)}`);
        logger.error(`Error url: ${error.response?.config.baseURL ?? ''}/${error.response?.config.url}`);
        logger.error(`Error data: ${error.response?.config.data}`);
        logger.error(`Error method: ${error.response?.config.method}`);
      }
      logger.error('Error during GRP API request:', error);
      throw error;
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<T> {
    logger.info(`MAKING GET REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T, D>(config: AxiosRequestConfig<D>): Promise<T> {
    logger.info(`MAKING POST REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'POST' });
  }
}
export default GrpApiService;
