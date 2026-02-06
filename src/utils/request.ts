import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  timestamp: number
}

class HttpClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const payload = response.data
        if (!payload || typeof payload.code === 'undefined') {
          return payload as any
        }

        const { code, msg } = payload

        // 兼容两种成功状态码：0 和 200
        if (code === 0 || code === 200) {
          return payload
        } else if (code === 401) {
          message.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          return Promise.reject(new Error(msg))
        } else {
          message.error(msg || '请求失败')
          return Promise.reject(new Error(msg))
        }
      },
      (error) => {
        if (error.response) {
          const { status } = error.response
          if (status === 401) {
            message.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            window.location.href = '/login'
          } else if (status === 403) {
            message.error('无权限访问')
          } else if (status === 404) {
            message.error('请求的资源不存在')
          } else if (status === 500) {
            message.error('服务器错误')
          } else {
            message.error(error.response.data?.msg || '请求失败')
          }
        } else if (error.request) {
          message.error('网络错误，请检查网络连接')
        } else {
          message.error('请求失败')
        }
        return Promise.reject(error)
      }
    )
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }
}

export default new HttpClient()
