import { axiosInstance } from './axiosInstance'


export const getSensor = async () => {
  const response = await axiosInstance.get('/sensors')
  return response
}

// 임계값 프리셋 전체 조회
export const getPresets = async () => {
  const response = await axiosInstance.get('/thresholds')
  return response.data
}

// 프리셋 생성
export const createPreset = async (data) => {
  const response = await axiosInstance.post('/thresholds', data)
  return response.data
}

// 프리셋 수정
export const updatePreset = async (id, data) => {
  const response = await axiosInstance.put(`/thresholds/${id}`, data)
  return response.data
}

// 프리셋 삭제
export const deletePreset = async (id) => {
  const response = await axiosInstance.delete(`/thresholds/${id}`)
  return response.data
}

// 프리셋 활성화
export const activatePreset = async (id) => {
  const response = await axiosInstance.put(`/thresholds/${id}/activate`)
  return response.data
}

// 알림 이력 조회
export const getAlerts = async () => {
  const response = await axiosInstance.get('/alerts')
  return response.data
}

/**
 * 관리자 재고 목록 조회
 * @param {{ page: number, size: number }} params - 페이지 파라미터
 */
export const getManagerProductStocks = async (params) => {
  const response = await axiosInstance.get('/manager/products/stocks', {params})
  return response
}

/**
 * 관리자 재고 수정
 * @param {number} productId - 수정할 상품 ID
 * @param {{ stock: number }} payload - 변경할 재고 수량
 */
export const updateManagerProductStock = async (productId, payload) => {
  const response = await axiosInstance.patch(`/manager/products/${productId}/stock`, payload)
  return response
}

/**
 * 기간별 센서 이력 조회
 * @param {string} start - 시작일 (yyyy-MM-dd)
 * @param {string} end - 종료일 (yyyy-MM-dd)
 */
export const getSensorHistory = async (start, end) => {
  const response = await axiosInstance.get('/sensors/history', {
    params: { start, end }
  })
  return response.data
}