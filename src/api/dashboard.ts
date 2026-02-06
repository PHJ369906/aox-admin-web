import request from '../utils/request'

/**
 * Dashboard统计 API
 */

/**
 * 综合统计数据类型
 */
export interface DashboardStatistics {
  totalUsers: number
  todayNewUsers: number
  userGrowthRate: number
  totalOrders: number
  todayOrders: number
  orderGrowthRate: number
  totalAmount: number
  todayAmount: number
  amountGrowthRate: number
  totalLogins: number
  todayLogins: number
  activeUsers: number
}

/**
 * 用户趋势数据类型
 */
export interface UserTrend {
  date: string
  newUsers: number
  activeUsers: number
}

/**
 * 支付趋势数据类型
 */
export interface PaymentTrend {
  date: string
  orderCount: number
  amount: number
}

/**
 * 支付方式分布类型
 */
export interface PaymentMethod {
  method: string
  count: number
  percentage: number
}

/**
 * 获取综合统计数据
 */
export const getStatistics = () => {
  return request.get<DashboardStatistics>('/v1/admin/dashboard/statistics')
}

/**
 * 获取用户趋势数据
 */
export const getUserTrend = () => {
  return request.get<UserTrend[]>('/v1/admin/dashboard/trends/user')
}

/**
 * 获取支付趋势数据
 */
export const getPaymentTrend = () => {
  return request.get<PaymentTrend[]>('/v1/admin/dashboard/trends/payment')
}

/**
 * 获取支付方式分布
 */
export const getPaymentMethods = () => {
  return request.get<PaymentMethod[]>('/v1/admin/dashboard/payment-methods')
}
