import request from '../utils/request'

/**
 * 小程序用户管理 API
 */

/**
 * 查询参数类型
 */
export interface MiniappUserQueryParams {
  pageNum?: number
  pageSize?: number
  phone?: string
  nickname?: string
  status?: number
  startTime?: string
  endTime?: string
}

/**
 * 用户信息类型
 */
export interface MiniappUser {
  userId: number
  username: string
  nickname: string
  avatar: string
  gender: number
  phone: string
  email: string
  signature: string
  status: number
  registerSource: string
  wxOpenid?: string
  createdAt: string
  lastLoginTime?: string
  lastLoginIp?: string
}

/**
 * 统计数据类型
 */
export interface UserStatistics {
  totalUsers: number
  todayNewUsers: number
  activeUsers: number
  disabledUsers: number
  wechatUsers: number
  phoneUsers: number
}

/**
 * 分页查询小程序用户列表
 */
export const getMiniappUserList = (params: MiniappUserQueryParams) => {
  return request.get('/v1/admin/miniapp/users', { params })
}

/**
 * 查询小程序用户详情
 */
export const getMiniappUserDetail = (userId: number) => {
  return request.get(`/v1/admin/miniapp/users/${userId}`)
}

/**
 * 更新小程序用户状态
 */
export const updateMiniappUserStatus = (userId: number, status: number) => {
  return request.put(`/v1/admin/miniapp/users/${userId}/status`, null, {
    params: { status }
  })
}

/**
 * 查询小程序用户统计数据
 */
export const getMiniappUserStatistics = () => {
  return request.get('/v1/admin/miniapp/users/statistics')
}
