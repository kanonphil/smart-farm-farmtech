import axios from "axios"


export const getSensor = async () => {
  try{
    const response = await axios.get('http://localhost:8080/sensors')
    return response
  }catch(e){
    console.log('센서 데이터 조회 실패', e)
  }
}