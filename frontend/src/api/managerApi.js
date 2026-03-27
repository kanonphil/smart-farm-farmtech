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