import { __DEV__ } from '@sk-web-gui/react';
import {
  DefaultError,
  QueryClient,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { apiURL } from '@utils/api-url';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

const handleError = (error: AxiosError | unknown) => {
  const axiosErr = axios.isAxiosError(error) ? error : null;
  if (axiosErr?.response?.status === 401 && !window?.location.pathname.includes('login')) {
    const path = window.location.pathname.includes('/valj-foretag') ? '/' : window.location.pathname;
    const message = (axiosErr.response?.data as { message?: string })?.message ?? '';
    window.location.href = `/login?path=${path}&failMessage=${message}`;
  }
};

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

const get = <T>(url: string, options?: { [key: string]: unknown }) =>
  axios.get<T>(apiURL(url), { ...defaultOptions, ...options });

const post = <T, D = unknown>(url: string, data?: D, options?: { [key: string]: unknown }) => {
  return axios.post<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

const remove = <T>(url: string, options?: { [key: string]: unknown }) => {
  return axios.delete<T>(apiURL(url), { ...defaultOptions, ...options });
};

const patch = <T, D = unknown>(url: string, data?: D, options?: { [key: string]: unknown }) => {
  return axios.patch<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

const put = <T, D = unknown>(url: string, data?: D, options?: { [key: string]: unknown }) => {
  return axios.put<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

export const apiService = { get, post, put, patch, delete: remove };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: Error) => {
        let shouldRetry = false;
        if (axios.isAxiosError(error)) {
          // Retry on aborted requests (e.g. navigation interrupted the request)
          shouldRetry =
            (error.code === 'ECONNABORTED' && failureCount < 2) ||
            (error.response?.status === 500 && failureCount < 3) ||
            error.message === 'Network Error';
        }
        if (shouldRetry) console.log('Retrying ....!');
        return shouldRetry;
      },
    },
  },
});

interface State {
  queryClient: QueryClient;
}

const initialState: State = {
  queryClient: queryClient,
};

export const useApiService = create<State>()(
  devtools(
    () => ({
      ...initialState,
    }),
    { name: 'api-service', enabled: __DEV__ }
  )
);
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type ContextDefault = { newBody: UseApiProps['body'] };

interface UseApiQueryProps<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TContext = ContextDefault,
> {
  url: string;
  method: 'get';
  axiosParameters?: AxiosRequestConfig;
  dataHandler?: (data: TQueryFnData) => TData;
  body?: Record<string, unknown>;
  queryKey?: TQueryKey;
  queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>;
  mutationOptions?: UseMutationOptions<TData, TError, unknown, TContext>;
}

interface UseApiMutationProps<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TContext = ContextDefault,
> {
  url: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  axiosParameters?: AxiosRequestConfig;
  dataHandler?: (data: TQueryFnData) => TData;
  body?: Record<string, unknown>;
  queryKey?: TQueryKey;
  queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>;
  mutationOptions?: UseMutationOptions<TData, TError, unknown, TContext>;
}

type UseApiProps<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TMethod extends Method = 'get',
  TContext = ContextDefault,
> = TMethod extends 'get'
  ? UseApiQueryProps<TQueryFnData, TError, TData, TQueryKey, TContext>
  : UseApiMutationProps<TQueryFnData, TError, TData, TQueryKey, TContext>;
interface Context {
  queryKey: QueryKey;
  signal: AbortSignal;
  meta: Record<string, unknown> | undefined;
  pageParam?: unknown;
  direction?: unknown;
}

interface DefaultApiCallConfig {
  url: string;
  method?: Method;
  body?: unknown;
  axiosParameters?: AxiosRequestConfig;
  context?: Context;
}
type DefaultApiCall = <TQueryFnData = unknown>(
  config: DefaultApiCallConfig
) => Promise<AxiosResponse<ApiResponse<TQueryFnData>>>;

const defaultApiCall: DefaultApiCall = <TQueryFnData>(config: DefaultApiCallConfig) => {
  if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
    return apiService[config.method]<TQueryFnData>(config.url, config?.body, {
      signal: config.context?.signal,
      ...config.axiosParameters,
      params: { pageParam: config.context?.pageParam, meta: config.context?.meta, ...config.axiosParameters?.params },
    });
  } else {
    return apiService[config.method ?? 'get']<TQueryFnData>(config.url, {
      signal: config.context?.signal,
      ...config.axiosParameters,
      params: { pageParam: config.context?.pageParam, meta: config.context?.meta, ...config.axiosParameters?.params },
    });
  }
};

type UseApiResult<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TMethod extends Method = 'get',
  TContext = ContextDefault,
> = TMethod extends 'get' ? UseQueryResult<TData, TError> : UseMutationResult<TData, TError, unknown, TContext>;

// Overloads for better type inference
export function useApi<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = string[],
  TContext = ContextDefault,
>(
  props: UseApiQueryProps<TQueryFnData, TError, TData, TQueryKey, TContext>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError>;

export function useApi<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = string[],
  TContext = ContextDefault,
>(
  props: UseApiMutationProps<TQueryFnData, TError, TData, TQueryKey, TContext>,
  queryClient?: QueryClient
): UseMutationResult<TData & { error?: DefaultError }, TError, unknown, TContext>;

export function useApi<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey & string[] = string[],
  TMethod extends Method = 'get',
  TContext = ContextDefault,
>(
  props: UseApiProps<TQueryFnData, TError, TData, TQueryKey, TMethod>,
  queryClient?: QueryClient
): UseApiResult<TQueryFnData, TError, TData, TMethod, TContext> {
  const {
    url,
    method,
    axiosParameters,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataHandler = (data: any) => data,
    body,
    queryKey = [url] as TQueryKey,
    queryOptions,
    mutationOptions,
  } = props;
  const _store_queryClient = useApiService((s) => s.queryClient);
  const _queryClient = queryClient ?? _store_queryClient;

  const defaultQueryCall = async (context: Context) =>
    defaultApiCall<TQueryFnData>({ url, method, body, axiosParameters, context }).then((res) =>
      dataHandler(res.data.data)
    );

  const defaultMutationCall = async (body: UseApiProps['body']) => {
    try {
      return defaultApiCall<TQueryFnData>({ url, method, body, axiosParameters }).then((res) =>
        dataHandler(res.data.data)
      );
    } catch (error) {
      handleError(error as AxiosError);
      return { error };
    }
  };

  if (method === 'get') {
    const enabled = queryOptions?.enabled ?? true;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(
      {
        queryKey,
        enabled,
        queryFn: defaultQueryCall,
        throwOnError: (error) => {
          handleError(error as AxiosError);
          return false;
        },
        ...queryOptions,
      },
      _queryClient
    ) as UseApiResult<TQueryFnData, TError, TData, TMethod, TContext>;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation(
      {
        mutationFn: defaultMutationCall,
        onMutate: async (body: Record<string, unknown>) => {
          await _queryClient.cancelQueries({ queryKey });
          const newBody = { ...body };
          return { newBody };
        },
        onSuccess: (result) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _queryClient.setQueryData<TQueryFnData & { error?: DefaultError }>(queryKey, result as any);
        },
        throwOnError: (error) => {
          handleError(error as AxiosError);
          return false;
        },
        ...mutationOptions,
      },
      _queryClient
    ) as UseApiResult<TQueryFnData, TError, TData, TMethod, TContext>;
  }
}
