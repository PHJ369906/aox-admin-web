import request from '../utils/request'
import type { Role, RoleQueryParams, RoleCreateData, RoleUpdateData } from '../types/role'

/**
 * 角色 API
 */

/**
 * 分页查询角色列表
 */
export const getRoleList = (params: RoleQueryParams) => {
  return request.get('/v1/system/roles', { params })
}

/**
 * 根据ID查询角色详情
 */
export const getRoleById = (roleId: number) => {
  return request.get(`/v1/system/roles/${roleId}`)
}

/**
 * 新增角色
 */
export const createRole = (data: RoleCreateData) => {
  return request.post('/v1/system/roles', data)
}

/**
 * 更新角色
 */
export const updateRole = (roleId: number, data: RoleUpdateData) => {
  return request.put(`/v1/system/roles/${roleId}`, data)
}

/**
 * 删除角色
 */
export const deleteRole = (roleId: number) => {
  return request.delete(`/v1/system/roles/${roleId}`)
}

/**
 * 分配权限
 */
export const assignPermissions = (roleId: number, permissionIds: number[]) => {
  return request.put(`/v1/system/roles/${roleId}/permissions`, permissionIds)
}

/**
 * 获取角色已分配的权限ID列表
 */
export const getRolePermissions = (roleId: number) => {
  return request.get(`/v1/system/roles/${roleId}/permissions`)
}
