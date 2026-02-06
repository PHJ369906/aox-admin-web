import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 用户信息类型
 */
export interface UserInfo {
  userId: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
}

/**
 * 认证状态类型
 */
interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  permissions: string[]
  roles: string[]
  isAuthenticated: boolean
}

/**
 * 认证操作类型
 */
interface AuthActions {
  setAuth: (data: {
    token: string
    refreshToken: string
    user: UserInfo
    permissions: string[]
    roles: string[]
  }) => void
  clearAuth: () => void
  updateUser: (user: Partial<UserInfo>) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

/**
 * 认证状态 Store
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      token: null,
      refreshToken: null,
      user: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,

      // 设置认证信息
      setAuth: (data) => {
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
          permissions: data.permissions,
          roles: data.roles,
          isAuthenticated: true,
        })
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          permissions: [],
          roles: [],
          isAuthenticated: false,
        })
      },

      // 更新用户信息
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      // 检查是否有指定权限
      hasPermission: (permission) => {
        return get().permissions.includes(permission)
      },

      // 检查是否有指定角色
      hasRole: (role) => {
        return get().roles.includes(role)
      },
    }),
    {
      name: 'aox-auth-storage', // localStorage key
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        permissions: state.permissions,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
