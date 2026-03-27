
//인증 및 인가에 대한 기능을 정의한 파일

import { jwtDecode } from "jwt-decode"

//0. 토큰 정보 가져오는 함수
export const getToken = () => {
  const token = localStorage.getItem('token')

  //토큰이 없다면 리턴 null
  if(token === null) return null

  return token.split(' ')[1]
}

//1. 토큰 만료 체크 함수(만료 시 리턴 true)
export const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token);

  //현재 날짜
  const currentTime = Date.now() / 1000 ;

  return decodedToken.exp < currentTime
}

//2. 사용가능한 토큰인지 체크하는 함수(사용 가능 토큰이면 리턴 true)
export const isAuthenticated = (token) => {
  //token이 없다면
  if(!token){
    return false
  }
  //만료가 됐다면
  if(isTokenExpired(token)){
    return false
  }

  return true
}

//3. 사용가능한 토큰이면서 관리자인지 체크하는 함수
export const isAdmin = (token) => {
  //유효한 토큰이 아니면
  if(!isAuthenticated(token)){
    return false
  }

  const role = jwtDecode(token).role;
  
  return role === 'ROLE_ADMIN'
}