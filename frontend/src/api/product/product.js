import axios from "axios"

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