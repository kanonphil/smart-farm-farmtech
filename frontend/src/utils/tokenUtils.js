import { jwtDecode } from "jwt-decode"

//토큰 복호화 함수
export const decodeToken = (token) => {

  // token이 있을시 복호화하여 decoded에 저장
  const decoded = token ? jwtDecode(token) : null

  return decoded
}