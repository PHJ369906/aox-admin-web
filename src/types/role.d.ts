/**
 * 角色类型定义
 */

export interface Role {
  roleId: number
  roleCode: string
  roleName: string
  roleSort: number
  dataScope?: number // 1全部 2本部门 3本部门及以下 4仅本人
  status?: number // 0正常 1禁用
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface RoleQueryParams {
  pageNum: number
  pageSize: number
  roleName?: string
  roleCode?: string
  status?: number
}

export interface RoleCreateData {
  roleCode: string
  roleName: string
  roleSort: number
  dataScope?: number
  status?: number
  remark?: string
  permissionIds?: number[]
}

export interface RoleUpdateData {
  roleId: number
  roleName: string
  roleSort: number
  dataScope?: number
  status?: number
  remark?: string
  permissionIds?: number[]
}

/**
 * 权限类型定义
 */

export interface Permission {
  permissionId: number
  permissionCode: string
  permissionName: string
  permissionType: number // 1菜单 2按钮 3接口
  path?: string
  component?: string
  icon?: string
  sortOrder?: number
  parentId: number
  children?: Permission[]
}

export interface PermissionTreeNode {
  permissionId: number
  permissionCode: string
  permissionName: string
  permissionType: number
  path?: string
  component?: string
  icon?: string
  sortOrder?: number
  parentId: number
  children?: PermissionTreeNode[]
}
