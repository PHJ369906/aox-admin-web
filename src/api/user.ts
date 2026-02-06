import request from '../utils/request'
import type { User, UserQueryParams, UserCreateData, UserUpdateData } from '../types/user'

/**
 * 用户 API
 */

/**
 * 分页查询用户列表
 */
export const getUserList = (params: UserQueryParams) => {
  return request.get('/v1/system/users', { params })
}

/**
 * 根据ID查询用户详情
 */
export const getUserById = (userId: number) => {
  return request.get(`/v1/system/users/${userId}`)
}

/**
 * 新增用户
 */
export const createUser = (data: UserCreateData) => {
  return request.post('/v1/system/users', data)
}

/**
 * 更新用户
 */
export const updateUser = (userId: number, data: UserUpdateData) => {
  return request.put(`/v1/system/users/${userId}`, data)
}

/**
 * 删除用户
 */
export const deleteUser = (userId: number) => {
  return request.delete(`/v1/system/users/${userId}`)
}

/**
 * 更新用户状态
 */
export const updateUserStatus = (userId: number, status: number) => {
  return request.put(`/v1/system/users/${userId}/status`, null, {
    params: { status }
  })
}

/**
 * 重置用户密码
 */
export const resetUserPassword = (userId: number, newPassword: string) => {
  return request.post(`/v1/system/users/${userId}/reset-password`, null, {
    params: { newPassword }
  })
}
