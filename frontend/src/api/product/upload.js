import axios from "axios"
import { axiosInstance } from "../axiosInstance";

export const uploadImageToS3 = async(file) => {
  const {data} = await axiosInstance.get('/products/presign',{
    params:{fileName : file.name}
  })
  await axios.put(data.presignedUrl, file, {
    headers: {'Content-Type' : file.type}
  })
  return data.fileUrl;
}