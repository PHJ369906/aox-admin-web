import { STORAGE_KEYS } from '@/constants'

/**
 * 认证服务
 */
export const AuthService = {
  /**
   * 获取 Token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  /**
   * 设置 Token
   */
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },

  /**
   * 移除 Token
   */
  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  /**
   * 清除所有认证信息
   */
  clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS)
  },
}

/**
 * 用户信息服务
 */
export const UserService = {
  /**
   * 获取用户信息
   */
  getUserInfo<T>(): T | null {
    const info = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    return info ? JSON.parse(info) : null
  },

  /**
   * 设置用户信息
   */
  setUserInfo<T>(userInfo: T): void {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
  },

  /**
   * 获取权限列表
   */
  getPermissions(): string[] {
    const perms = localStorage.getItem(STORAGE_KEYS.PERMISSIONS)
    return perms ? JSON.parse(perms) : []
  },

  /**
   * 设置权限列表
   */
  setPermissions(permissions: string[]): void {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions))
  },

  /**
   * 检查是否有指定权限
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions()
    return permissions.includes(permission) || permissions.includes('*:*:*')
  },

  /**
   * 检查是否有任意一个权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((perm) => this.hasPermission(perm))
  },
}
