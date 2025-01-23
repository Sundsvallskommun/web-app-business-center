import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { User } from '@/interfaces/users.interface';
import { logger } from '@/utils/logger';
import { apiURL } from '@/utils/util';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import ApiTokenService from './api-token.service';

class ApiResponse<T> {
  data: T;
  message: string;
}

interface ApiRequest extends Omit<Partial<RequestWithUser>, 'session'> {
  session: Omit<Partial<Request['session']>, 'user'> & { user?: Pick<User, 'username'> };
}

class ApiService {
  private apiTokenService = new ApiTokenService();
  private async request<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    const token = await this.apiTokenService.getToken();

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-issuer': req.session?.user?.username,
    };
    const defaultParams = {};

    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...defaultHeaders, ...config.headers },
      params: { ...defaultParams, ...config.params },
      url: apiURL(config.url),
    };

    try {
      const res = await axios(preparedConfig);
      return { data: res.data, message: 'success' };
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 404) {
        console.error(`API request 404:ed for url: ${error.response.config.url}`);
        throw new HttpException(404, 'Not found');
      } else if (axios.isAxiosError(error) && (error as AxiosError).response?.data) {
        console.error(`ERROR: API request failed with status: ${error.response?.status}`);
        console.error('Error details:', error.response.data);
        console.error('Error url:', error.response.config.url);
        console.error('Error data:', error.response.config.data);
        console.error('Error method:', error.response.config.method);
        console.error('Error headers:', error.response.config.headers);
        logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
        logger.error('Error details:', error.response.data);
        logger.error('Error url:', error.response.config.url);
        logger.error('Error data:', error.response.config.data);
        logger.error('Error method:', error.response.config.method);
        logger.error('Error headers:', error.response.config.headers);
      } else {
        console.error('Unknown error:', error);
        logger.error('Unknown error:', error);
      }
      // NOTE: did you subscribe to the API called?
      throw new HttpException(500, 'Internal server error from gateway');
    }
  }

  public async get<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET' }, req);
  }

  public async post<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST' }, req);
  }

  public async put<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT' }, req);
  }

  public async patch<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH' }, req);
  }

  public async delete<T>(config: AxiosRequestConfig, req: ApiRequest): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' }, req);
  }
}

export default ApiService;
