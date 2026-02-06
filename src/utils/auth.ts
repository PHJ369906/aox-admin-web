/**
 * Token 相关工具函数
 */

const TOKEN_KEY = 'aox_token'
const REFRESH_TOKEN_KEY = 'aox_refresh_token'
const USER_INFO_KEY = 'aox_user_info'

/**
 * 获取 Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取 Refresh Token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 设置 Refresh Token
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 移除 Refresh Token
 */
export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): any | null => {
  const userInfoStr = localStorage.getItem(USER_INFO_KEY)
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch (e) {
      return null
    }
  }
  return null
}

/**
 * 设置用户信息
 */
export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 移除用户信息
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}
