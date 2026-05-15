import { Id } from 'react-toastify';

export type RequestConfig = {
  reqParams: RequestParamsType;
  reqInitConfig?: RequestInteractionConfigType;
};

export type RequestParamsType = {
  token?: string;
  json?: string | FormData;
  headers?: Map<string, string>;
  query?: Record<string, unknown>;
};

export type RequestInteractionConfigType = {
  toastError?: boolean;
  throws?: boolean;
  toastify?: Id;
  toastifySuccessMsg?: string;
};

export type DataResponse<T> = {
  data: Array<T>;
};

export type PaginatedResponse<T> = {
  data: Array<T>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

// Formato de erro devolvido pelo backend (mensagem já traduzida para o usuário)
export type ApiErrorResponse = {
  errorDate: string;
  error: string;
  errorCode: string;
  httpCodeMessage: string;
};
