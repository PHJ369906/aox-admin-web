/**
 * 用户类型定义
 */

export interface User {
  userId: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  gender?: number // 0女 1男 2未知
  status?: number // 0正常 1禁用
  deptId?: number
  lastLoginTime?: string
  lastLoginIp?: string
  createTime?: string
  updateTime?: string
  remark?: string
}

export interface UserQueryParams {
  pageNum: number
  pageSize: number
  username?: string
  nickname?: string
  phone?: string
  status?: number
  deptId?: number
}

export interface UserCreateData {
  username: string
  password: string
  nickname: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  status?: number
  deptId?: number
  roleIds?: number[]
  remark?: string
}

export interface UserUpdateData {
  userId: number
  nickname?: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  status?: number
  deptId?: number
  roleIds?: number[]
  remark?: string
}
