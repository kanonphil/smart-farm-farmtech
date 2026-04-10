import axios from "axios";
import useAuthStore from '../store/authStore'


//axios 객체 생성 -> 앞으로 모든 통신은 해당 객체로 진행
export const axiosInstance = axios.create({
  baseURL : 'http://localhost:8080', //통신할 서버의 기본 url
  withCredentials : true //쿠키 인증 데이터도 통신하기 위한 세팅
})

//요청 인터셉터 -> 토큰을 요청 헤더에 실는다
//첫번째 매개변수 : 요청 시 작업할 내용, 화살표 함수
//두번째 매개변수 : 요청 중 오류 발생 시 내용, 화살표 함수
axiosInstance.interceptors.request.use(
  config => {
    // Zustand store에서 토큰 읽기
    // getState()는 훅 없이 store 값을 직접 꺼내는 방법
    // React 컴포넌트 밖에서 store에 접근할 때 사용
    const token = useAuthStore.getState().token

    if(token){
      config.headers.Authorization = token
    }
    
    return config
  }, 
  error => {
    console.error('axios 요청 오류', error)
    return Promise.reject(error)
  }
)

//응답 인터셉터
//첫번째 매개변수 : 응답 시 작업할 내용, 화살표 함수
//두번째 매개변수 : 응답 중 오류 발생 시 내용, 화살표 함수
let isRefreshing = false // refresh 진행 중 여부

axiosInstance.interceptors.response.use(
  response => { return response }, 
  async error => {
    console.error('axios 오류 : ', error.response?.status, error.config?.url);
    
    // 401 에러이고 refresh 요청이 아닐 때
    if (error.response?.status === 401 && error.config?.url !== '/members/refresh') {
      // 이미 refresh 중이면 그냥 reject
      if(isRefreshing) return Promise.reject(error);

      isRefreshing = true  //refresh 시작

      try{
        const response = await axiosInstance.post('/members/refresh')
        const newToken = response.headers['authorization']
        useAuthStore.getState().setToken(newToken)
        error.config.headers['Authorization'] = newToken
        return axiosInstance(error.config)
      } catch (e) {
        useAuthStore.getState().clearToken()
        useAuthStore.getState().showAlert('로그인이 만료되었습니다. 다시 로그인해주세요.', () => {
          window.location.href = '/login'
        })
      } finally {
        isRefreshing = false // refresh 끝나면 초기화
      }
    }
    return Promise.reject(error)
  }
)