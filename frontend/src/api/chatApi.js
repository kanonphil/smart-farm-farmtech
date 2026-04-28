import { axiosInstance } from './axiosInstance'

// 전체 채팅방 목록 (매니저용)
export const getAllRooms = async () => {
  const response = await axiosInstance.get('/chat/rooms')
  return response.data
}

// 채팅방 메시지 이력 조회
export const getMessages = async (roomId) => {
  const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`)
  return response.data
}

// 채팅방 종료
export const closeRoom = async (roomId) => {
  await axiosInstance.patch(`/chat/rooms/${roomId}/close`)
}