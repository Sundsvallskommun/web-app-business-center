import { HttpException } from '@/exceptions/HttpException';
import { ApiResponse } from '@/interfaces/service';
import { logger } from '@utils/logger';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ApiTokenService from './api-token.service';

const apiTokenService = new ApiTokenService();

/** Gateway auth + tracing headers, matching what {@link ApiService} sends on every call. */
const gatewayHeaders = async (): Promise<Record<string, string>> => {
  const token = await apiTokenService.getToken();
  const requestId = uuidv4();
  logger.info(`x-request-id: ${requestId}`);
  return { Authorization: `Bearer ${token}`, 'X-Request-Id': requestId };
};

/**
 * Logs the real upstream error from caremanagement and maps it to an HttpException.
 * 4xx statuses are propagated as-is (with the upstream detail when available); everything
 * else becomes a 500. Without this the actual caremanagement error was invisible.
 */
const toHttpException = (error: unknown, config: AxiosRequestConfig): HttpException => {
  if (axios.isAxiosError(error)) {
    const status = (error as AxiosError).response?.status;
    const data = (error as AxiosError).response?.data;
    logger.warn(
      `[caremanagement] ${config.method ?? 'GET'} ${config.url} failed: ${status ?? 'no-status'} ${data ? JSON.stringify(data) : error.message}`,
    );
    if (status === 404) return new HttpException(404, 'Not found');
    if (status && status >= 400 && status < 500) {
      const detail = (data as { detail?: string } | undefined)?.detail;
      return new HttpException(status, typeof detail === 'string' && detail ? detail : 'Bad request to caremanagement');
    }
  } else {
    logger.error(`[caremanagement] ${config.method ?? 'GET'} ${config.url} failed: ${(error as Error)?.message ?? error}`);
  }
  return new HttpException(500, 'Internal server error from caremanagement');
};

/** caremanagement responses also expose the Location header — set on 201 Created (empty body). */
export interface CaremanagementResponse<T> extends ApiResponse<T> {
  location?: string;
}

/**
 * Transport for the caremanagement API, called through the shared API gateway (WSO2).
 *
 * Kept separate from {@link ApiService} because callers need the Location header (201 Created)
 * and the upstream 4xx detail. Callers pass the absolute URL built by {@link caremanagementUrl};
 * it is used verbatim.
 */
class CaremanagementApiService {
  private async request<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { 'Content-Type': 'application/json', ...(await gatewayHeaders()), ...config.headers },
    };

    try {
      const res = await axios(preparedConfig);
      return { data: res.data, message: 'success', location: res.headers?.location };
    } catch (error: unknown) {
      throw toHttpException(error, preparedConfig);
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    return this.request<T>({ ...config, method: 'POST' });
  }

  public async patch<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH' });
  }

  public async delete<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }

  /**
   * POST multipart/form-data (e.g. attachments). Does NOT force a JSON content-type — axios derives
   * the multipart boundary from the FormData body itself.
   */
  public async postForm<T>(config: AxiosRequestConfig): Promise<CaremanagementResponse<T>> {
    try {
      const res = await axios({
        ...config,
        method: 'POST',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { ...(await gatewayHeaders()), ...config.headers },
      });
      return { data: res.data, message: 'success', location: res.headers?.location };
    } catch (error: unknown) {
      throw toHttpException(error, { ...config, method: 'POST' });
    }
  }
}

export default CaremanagementApiService;
