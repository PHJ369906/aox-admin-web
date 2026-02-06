import request from '../utils/request'

/**
 * Banner管理 API
 */

/**
 * Banner数据类型
 */
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  linkType: number
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * Banner创建/更新参数
 */
export interface BannerDTO {
  title: string
  imageUrl: string
  linkUrl?: string
  linkType: number
  sortOrder: number
  status: number
}

/**
 * 分页查询Banner列表
 */
export const getBannerList = (pageNum: number, pageSize: number, status?: number) => {
  return request.get('/v1/admin/banners', {
    params: { pageNum, pageSize, status }
  })
}

/**
 * 查询Banner详情
 */
export const getBannerDetail = (id: number) => {
  return request.get(`/v1/admin/banners/${id}`)
}

/**
 * 创建Banner
 */
export const createBanner = (data: BannerDTO) => {
  return request.post('/v1/admin/banners', data)
}

/**
 * 更新Banner
 */
export const updateBanner = (id: number, data: BannerDTO) => {
  return request.put(`/v1/admin/banners/${id}`, data)
}

/**
 * 删除Banner
 */
export const deleteBanner = (id: number) => {
  return request.delete(`/v1/admin/banners/${id}`)
}

/**
 * 更新Banner状态
 */
export const updateBannerStatus = (id: number, status: number) => {
  return request.put(`/v1/admin/banners/${id}/status`, null, {
    params: { status }
  })
}

/**
 * 批量更新排序
 */
export const batchUpdateSort = (banners: { id: number; sortOrder: number }[]) => {
  return request.put('/v1/admin/banners/sort', banners)
}
