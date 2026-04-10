// zustand 라이브러리에서 create 함수를 가져옴
// create 함수로 전역 상태 저장소(store)를 만들 수 있음
import { create } from "zustand";

// create() 함수로 store 생성
// set은 store의 값을 변경할 때 사용하는 함수 (React의 setState와 비슷)
const useAuthStore = create((set) => ({

  // 토큰을 저장하는 전역 변수
  // 초기값은 null (로그인 전이니까)
  token: null,

  isAuthReady: false,
  notification: [],

  // 토큰을 저장하는 함수
  // 로그인 성공 시 이 함수를 호출해서 token에 값을 저장
  // set({ token }) = token 값을 새로운 값으로 변경
  setToken:(token) => set({ token }),

  // 토큰을 삭제하는 함수
  // 로그아웃 시 이 함수를 호출해서 token을 null로 초기화
  clearToken: () => set({ token : null }),
  setAuthReady: () => set({ isAuthReady: true }),

  // 알림 관련 액션
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  removeNotification: (notificationId) => set((state) => ({
    notifications: state.notifications.filter(n => n.notificationId !== notificationId)
  })),
  
  alertModal: { show: false, message: '', callback: null },
  showAlert: (message, callback) => set({ alertModal: { show: true, message, callback } }),
  closeAlert: () => set({ alertModal: { show: false, message: '', callback: null } }),
}))

export default useAuthStore