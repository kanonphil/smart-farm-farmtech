import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { getProduct } from '../../api/product/product';

const ProductDetail = () => {
  const nav = useNavigate();
  const {productId} = useParams();

  //상품 상세 정보 저장 state 변
  const [product, setProduct] = useState({})

  const getProductDetail = async () => {
    const response = await getProduct(productId);
    setProduct(response.data)
  }

  useEffect(()=>{
    getProductDetail()
  }, [])

  console.log(product)


  return (
    <div className={styles.container}>
      <div className={styles.product_info}>
        <div>
          <img src={`http://localhost:8080/uploads/${product.productImageList[2].ImageSavedName}`}/>
        </div>
        <div></div>
      </div>
    </div>
  )
}

export default ProductDetail