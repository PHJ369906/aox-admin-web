import request from '@/utils/request'

export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    userId: number
    username: string
    nickname: string
    avatar: string
  }
  permissions: string[]
  roles: string[]
}

export interface PageResult<T> {
  total: number
  list: T[]
  pageNum: number
  pageSize: number
  totalPages: number
}

/**
 * 登录
 */
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/v1/auth/login', data)
}

/**
 * 登出
 */
export const logout = () => {
  return request.post('/v1/auth/logout')
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get<LoginResponse['user']>('/v1/auth/current-user')
}
