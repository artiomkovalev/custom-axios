export type ApiErrorParamValue = string | number | boolean;

export interface ApiErrorField {
  code: string;
  message: string;
  field: string;
  params: Record<string, ApiErrorParamValue>;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  path: string;
  timestamp: string;
  traceId: string;
  errors: ApiErrorField[];
  params: Record<string, ApiErrorField>;
}

export interface ApiErrorPayload {
  message: string;
  status?: number;
  code?: string;
  path?: string;
  timestamp?: string;
  traceId?: string;
  errors?: ApiErrorField[];
  params?: Record<string, ApiErrorParamValue>;
}
