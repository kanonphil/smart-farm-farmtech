import axios from "axios";
import { axiosInstance } from "../axiosInstance";
import { data } from "react-router-dom";

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

/**
 * 회원 전체 정보 조회
 * @param {*} memberEmail 
 * @returns 
 */
export const getAllInfo = async (memberEmail) => {
    const response = await axiosInstance.get(`members/${memberEmail}`)
    return response
}


/**
 * 회원 정보 수정
 * @param {*} data 
 * @returns 
 */
export const setInfo = async(data) => {
    try{
        const response = await axiosInstance.put('members/set-info', data)
        return response
    }catch(e){
        console.log("회원 정보 수정 실패",e)
    }
}

export const setPw = async(data) => {
    try{
        const response = await axiosInstance.patch('members/set-pw', data)
        return response
    }catch(e){
        console.log("비밀번호 변경 실패", e)
    }
}


