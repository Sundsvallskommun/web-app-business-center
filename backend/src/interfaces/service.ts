export interface ApiResponseMeta {
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
