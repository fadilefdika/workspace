const BASE_URL = process.env.NEXT_PUBLIC_API_URL ||'http://localhost:4000/api/v1';

export class ApiError extends Error {
 public code: string;
 public status: number;

 constructor(message: string, code: string ='UNKNOWN_ERROR', status: number = 500) {
 super(message);
 this.code = code;
 this.status = status;
 Object.setPrototypeOf(this, ApiError.prototype);
 }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
 const url = `${BASE_URL}${endpoint}`;
 const headers = {
'Content-Type':'application/json',
 ...(options.headers || {}),
 };

 const response = await fetch(url, {
 ...options,
 headers,
 });

 if (response.status === 204) {
 return {} as T;
 }

 const data = await response.json().catch(() => ({}));

 if (!response.ok) {
 const errorMsg = data?.error?.message || response.statusText ||'API request failed';
 const errorCode = data?.error?.code ||'API_ERROR';
 throw new ApiError(errorMsg, errorCode, response.status);
 }

 return data as T;
}

export const apiClient = {
 get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method:'GET', ...options }),
 post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
 request<T>(endpoint, { method:'POST', body: JSON.stringify(body), ...options }),
 patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
 request<T>(endpoint, { method:'PATCH', body: JSON.stringify(body), ...options }),
 delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method:'DELETE', ...options }),
};

