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

export const handleError = (error) => {
  if (error?.response?.status === 401 && !window?.location.pathname.includes('login')) {
    window.location.href = `/login?path=${window.location.pathname}&failMessage=${error.response.data.message}`;
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

const post = <T>(url: string, data: unknown = undefined, options?: { [key: string]: unknown }) => {
  return axios.post<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

const remove = <T>(url: string, options?: { [key: string]: unknown }) => {
  return axios.delete<T>(apiURL(url), { ...defaultOptions, ...options });
};

const patch = <T>(url: string, data: unknown = undefined, options?: { [key: string]: unknown }) => {
  return axios.patch<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

const put = <T>(url: string, data: unknown = undefined, options?: { [key: string]: unknown }) => {
  return axios.put<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

export const apiService = { get, post, put, patch, delete: remove };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: AxiosError) => {
        console.log(`Response Code: ${error.response?.status} failureCount: ${failureCount}`);
        const shouldRetry = error.response?.status === 500 && failureCount < 3;
        if (shouldRetry) console.log('Retrying ....!');
        // retry on 500 errors for max 3 times
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
  queryOptions?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
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
  queryOptions?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
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

export const defaultApiCall: <TQueryFnData = unknown>(config: {
  url: string;
  method?: Method;
  body?: unknown;
  axiosParameters?: AxiosRequestConfig;
  context?: {
    queryKey: QueryKey;
    signal: AbortSignal;
    meta: Record<string, unknown> | undefined;
    pageParam?: unknown;
    direction?: unknown;
  };
}) => Promise<AxiosResponse<ApiResponse<TQueryFnData>>> = <TQueryFnData>(config) => {
  return apiService[config.method ?? 'get']<TQueryFnData>(config.url, config.body, {
    signal: config.context?.signal,
    ...config.axiosParameters,
    params: { pageParam: config.context?.pageParam, meta: config.context?.meta, ...config.axiosParameters?.params },
  });
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
  TQueryKey extends QueryKey = [''],
  TContext = ContextDefault,
>(
  props: UseApiQueryProps<TQueryFnData, TError, TData, TQueryKey, TContext>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError>;

export function useApi<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = [''],
  TContext = ContextDefault,
>(
  props: UseApiMutationProps<TQueryFnData, TError, TData, TQueryKey, TContext>,
  queryClient?: QueryClient
): UseMutationResult<TData & { error?: DefaultError }, TError, unknown, TContext>;

export function useApi<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey & string[] = [''],
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
    dataHandler = (data) => data,
    body,
    queryKey = [url] as TQueryKey,
    queryOptions,
    mutationOptions,
  } = props;
  const _store_queryClient = useApiService((s) => s.queryClient);
  const _queryClient = queryClient ?? _store_queryClient;

  const defaultQueryCall = async (context) =>
    defaultApiCall<TQueryFnData>({ url, method, body, axiosParameters, context }).then((res) =>
      dataHandler(res.data.data)
    );

  const defaultMutationCall = async (body: UseApiProps['body']) => {
    try {
      return defaultApiCall<TQueryFnData>({ url, method, body, axiosParameters }).then((res) =>
        dataHandler(res.data.data)
      );
    } catch (error) {
      handleError(error);
      return { error };
    }
  };

  if (method === 'get') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(
      {
        queryKey,
        queryFn: defaultQueryCall,
        throwOnError: (error) => {
          handleError(error);
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
          _queryClient.setQueryData<TQueryFnData & { error?: DefaultError }>(queryKey, result);
        },
        throwOnError: (error) => {
          handleError(error);
          return false;
        },
        ...mutationOptions,
      },
      _queryClient
    ) as UseApiResult<TQueryFnData, TError, TData, TMethod, TContext>;
  }
}
