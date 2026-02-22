/**
 * HTTP Client service - Transform mode example
 */

import type { ApiResponse } from '../types'

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface HttpClientOptions {
  baseUrl: string
  defaultHeaders?: Record<string, string>
  timeout?: number
}

export class HttpClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private timeout: number

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    }
    this.timeout = options.timeout || 30000
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const method = config.method || 'GET'
    const headers = { ...this.defaultHeaders, ...config.headers }
    const timeout = config.timeout || this.timeout

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = (await response.json()) as T

      if (!response.ok) {
        return {
          success: false,
          data: null as T,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: Date.now(),
        }
      }

      return {
        success: true,
        data,
        timestamp: Date.now(),
      }
    } catch (error) {
      clearTimeout(timeoutId)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        data: null as T,
        error: errorMessage,
        timestamp: Date.now(),
      }
    }
  }

  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  return new HttpClient(options)
}
