import axios from 'axios'
import request from '../utils/request'

/**
 * 支付订单管理 API
 */

/**
 * 查询参数类型
 */
export interface PaymentOrderQueryParams {
  pageNum?: number
  pageSize?: number
  orderNo?: string
  phone?: string
  userId?: number
  paymentType?: string
  status?: number
  startTime?: string
  endTime?: string
}

/**
 * 订单信息类型
 */
export interface PaymentOrder {
  orderId: number
  orderNo: string
  paymentNo: string
  paymentType: string
  paymentMethod: string
  amount: number
  currency: string
  subject: string
  body: string
  status: number
  userId: number
  userNickname?: string
  userPhone?: string
  payTime?: string
  transactionId?: string
  tenantId: number
  createTime: string
  updateTime: string
}

/**
 * 统计数据类型
 */
export interface PaymentStatistics {
  totalOrders: number
  todayOrders: number
  totalAmount: number
  todayAmount: number
  successOrders: number
  pendingOrders: number
  refundOrders: number
  wechatOrders: number
  alipayOrders: number
  successRate: number
}

/**
 * 分页查询支付订单列表
 */
export const getPaymentOrderList = (params: PaymentOrderQueryParams) => {
  return request.get('/v1/admin/payment/orders', { params })
}

/**
 * 查询支付订单详情
 */
export const getPaymentOrderDetail = (orderId: number) => {
  return request.get(`/v1/admin/payment/orders/${orderId}`)
}

/**
 * 查询支付订单统计数据
 */
export const getPaymentStatistics = () => {
  return request.get('/v1/admin/payment/orders/statistics')
}

/**
 * 导出支付订单（暂未实现）
 */
export const exportPaymentOrders = (params: PaymentOrderQueryParams) => {
  const token = localStorage.getItem('token')
  return axios.get('/api/v1/admin/payment/orders/export', {
    params,
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}
