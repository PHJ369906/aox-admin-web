import request from '../utils/request'
import type { PermissionTreeNode } from '../types/role'

/**
 * 权限 API
 */

/**
 * 获取权限树
 */
export const getPermissionTree = () => {
  return request.get<{ code: number; data: PermissionTreeNode[]; msg: string }>('/v1/system/permissions/tree')
}
