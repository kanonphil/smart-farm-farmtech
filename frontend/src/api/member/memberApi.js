import axios from "axios";
import { axiosInstance } from "../axiosInstance";

//회원가입 등록 API
export const regMember = async(regForm) => {
    try{
        const response = await axios.post('http://localhost:8080/members',regForm)
        return response;
    } catch(e){
     console.log("회원가입 등록 오류",e)
    }
}

/**
 * 이메일 중복 여부를 서버에 확인하는 함수
 * @param string email
 * @returns {Promise<boolean>} -중복이면 true, 사용가능하면 false를 반환
 */
export const checkEmailDuplicate = async(email) =>{
    try{
        const response = await axios.get('http://localhost:8080/members/check-email',{params : {memEmail:email} })
        return response;
    }catch(e){
        console.log("회원가입 - 이메일 중복 체크 오류",e)
    }
}

/**
 * 로그인 API
 * @param {*} loginData 
 * @returns 
 */
export const goLogin = async (loginData) => {
    const response = await axiosInstance.post('/members/login', loginData)
    return response
}

/**
 * 비밀번호 확인 API
 * @param {*} loginData 
 * @returns 
 */
export const confirmPw = async (loginData) => {
    const response = await axiosInstance.post('/members/confirm-pw', loginData)
    return response
}
