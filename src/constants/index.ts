/**
 * API 相关常量
 */
export const API_CONSTANTS = {
  // 请求超时时间（毫秒）
  TIMEOUT: 30000,

  // 成功响应码
  SUCCESS_CODE: 0,

  // 认证失败响应码
  UNAUTHORIZED_CODE: 401,

  // 无权限响应码
  FORBIDDEN_CODE: 403,
}

/**
 * 存储 Key 常量
 */
export const STORAGE_KEYS = {
  TOKEN: 'aox_token',
  USER_INFO: 'aox_user_info',
  PERMISSIONS: 'aox_permissions',
  THEME: 'aox_theme',
  LANGUAGE: 'aox_language',
}

/**
 * 分页常量
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
}

/**
 * 状态常量
 */
export const STATUS = {
  NORMAL: 0,
  DISABLED: 1,
}

/**
 * 性别常量
 */
export const GENDER = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2,
}

/**
 * 权限类型常量
 */
export const PERMISSION_TYPE = {
  MENU: 1,
  BUTTON: 2,
  API: 3,
}

/**
 * 日期格式常量
 */
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
}
