import axios from "axios"
import { axiosInstance } from "../axiosInstance";

export const regProductAPI = async(productData) => {
  try{
    const fileConfig = {
      header : {'Content-Type' : 'multipart/form-data'}
    };
    const response = await axios.post('http://localhost:8080/products', productData, fileConfig)
    return response;
  } catch(e) {
    console.log('상품 등록 axios 오류',e);
  }
}

export const getCategory = async() => {
  try{
    const reponse = await axios.get('http://localhost:8080/products/category')
    return reponse;
  } catch(e){
     console.log('상품 등록 시 카테고리 axios 오류',e)
  }
}

/**
 * 상품 목록 조회 API
 * GET /products
 * V_PRODUCT_LIST VIEW 기반으로 ACTIVE 상태의 상품 목록과 대표 이미지를 반환
 * @param {string|null} sort - 정렬 기준 (sales_desc / price_desc / price_asc / null: 기본값)
 * @returns {Promise<Array>} 상품 목록 배열
 */
export const getProductList = async (sort = null) => {
  const response = await axiosInstance.get('/products', {
    params: { sort }
  })
  return response.data
}
/**
 * 해당 번호의 상품 상세 조회
 * @param {*} productId 
 * @returns 
 */
export const getProduct = async (productId) => {
  const response = await axiosInstance.get(`/products/${productId}`)
  return response
}

/**
 * 카트에 상품 담기
 * @param {*} item 
 * @returns 
 */
export const insertCartItem = async (item) => {
  const response = await axiosInstance.post('/carts', item)
  return response
}

/**
 * 카트에 담긴 상품 조회
 * @returns 
 */
export const getCartItems = async () => {
  const response = await axiosInstance.get('/carts/items')
  return response
}

/**
 * 카트에 담긴 상품 수량 변경
 * @param {*} data 
 * @returns 
 */
export const putCnt = async (data) => {
  const response = await axiosInstance.put('/carts/cnt', data)
  return response
}

/**
 * 카트 선택 상품 삭제
 * @param {*} idList 
 * @returns 
 */
export const deleteItem = async (idList) => {
  const response = await axiosInstance.delete('/carts/item', {data : idList})
  return response
}

/**
 * 카트 전체 상품 삭제
 * @returns 
 */
export const deleteAllItem = async () => {
  const response = await axiosInstance.delete('/carts/all')
  return response
}

/**
 * 주문 정보 저장 
 * @param {} data 
 * @returns 
 */
export const insertOrder = async (data) => {
  const response = await axiosInstance.post('/orders', data)
  return response
}