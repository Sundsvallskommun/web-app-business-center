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
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const handleError = (error) => {
  console.log('handleError, error', error);
  if (error?.response?.status === 401 && !window?.location.pathname.includes('login')) {
    window.location.href = `/login?path=${window.location.pathname}&failMessage=${error.response.data.message}`;
  }

  // throw error;
};

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const get = <T>(url: string, data: any = undefined, options?: { [key: string]: any }) =>
  axios.get<T>(apiURL(url), { ...defaultOptions, ...options });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const post = <T>(url: string, data: any, options?: { [key: string]: any }) => {
  return axios.post<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remove = <T>(url: string, data: any, options?: { [key: string]: any }) => {
  return axios.delete<T>(apiURL(url), { ...defaultOptions, ...options });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patch = <T>(url: string, data: any, options?: { [key: string]: any }) => {
  return axios.patch<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const put = <T>(url: string, data: any, options?: { [key: string]: any }) => {
  return axios.put<T>(apiURL(url), data, { ...defaultOptions, ...options });
};

export const apiService = { get, post, put, patch, delete: remove };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 0,
    },
  },
});

interface State {
  queryClient: QueryClient;
}

interface Actions {}

const initialState: State = {
  queryClient: queryClient,
};

export const useApiService = create<State & Actions>()(
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

  const defaultMutationCall = async (body: UseApiProps['body']) =>
    defaultApiCall<TQueryFnData>({ url, method, body, axiosParameters })
      .then((res) => dataHandler(res.data.data))
      .catch((error) => ({ error }));

  if (method === 'get') {
    return useQuery(
      {
        queryKey,
        queryFn: defaultQueryCall,
        ...queryOptions,
      },
      _queryClient
    ) as UseApiResult<TQueryFnData, TError, TData, TMethod, TContext>;
  } else {
    return useMutation(
      {
        mutationFn: defaultMutationCall,
        onMutate: async (body: Record<string, unknown>) => {
          await _queryClient.cancelQueries({ queryKey });
          const newBody = { ...body };
          return { newBody };
        },
        onSuccess: (result, body, context) => {
          _queryClient.setQueryData<TQueryFnData & { error?: DefaultError }>(queryKey, result);
        },
        ...mutationOptions,
      },
      _queryClient
    ) as UseApiResult<TQueryFnData, TError, TData, TMethod, TContext>;
  }
}
