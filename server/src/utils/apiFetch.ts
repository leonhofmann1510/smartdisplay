export class FetchError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  headers?: Record<string, string>
  token?: string
  timeout?: number
}

async function request<T>(
  method: HttpMethod,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const init: RequestInit = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  if (options.timeout) {
    init.signal = AbortSignal.timeout(options.timeout)
  }

  const res = await fetch(url, init)

  let json: unknown
  const contentType = res.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    json = await res.json()
  } else {
    const text = await res.text()
    throw new FetchError(res.status, `Non-JSON response: ${text}`)
  }

  if (!res.ok) {
    throw new FetchError(res.status, `Request failed with status ${res.status}`, json)
  }

  return json as T
}

export const apiFetch = {
  get<T>(url: string, options?: RequestOptions) {
    return request<T>('GET', url, undefined, options)
  },

  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', url, body, options)
  },

  put<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', url, body, options)
  },

  patch<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', url, body, options)
  },

  delete<T>(url: string, options?: RequestOptions) {
    return request<T>('DELETE', url, undefined, options)
  },
}
