import React, { useEffect, useState } from 'react'
import { getCategory, getProductListManager } from '../../api/product/product';
import styles from './Products.module.css'
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, [])

  const fetchProducts = async () => {
    const response = await getProductListManager();
    setProducts(response.data);
  }

  const fetchCategory = async () => {
    const response = await getCategory();
    setCategories(response.data);
  }

  // categoryId로 카테고리명 찾는 함수
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category ? category.categoryName : '-';
  }

  const handleEdit = (productId) => {
    // 수정 API 연결 예정
    console.log('수정', productId);
  }

  const handleDelete = (productId) => {
    // 삭제 API 연결 예정
    console.log('삭제', productId);
  }

  // 테이블 헤더 정의
  const headers = [[
    { label: 'No' },
    { label: '카테고리' },
    { label: '이미지' },
    { label: '상품명' },
    { label: '가격' },
    { label: '재고' },
    { label: '판매량' },
    { label: '상태' },
    { label: '관리' },
  ]]
  console.log(products);
  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h2>상품 목록</h2>
        <Button variant='primary' size='small'>+ 상품 등록</Button>
      </div>

      <div className={styles.tableWrap}>
      <Table
        headers={headers}
        data={products}
        renderRow={(product, index) => (
          <>
            <td>{index + 1}</td>
            <td>{getCategoryName(product.categoryId)}</td>
            <td>
              {product.mainImage
                ? <img src={product.mainImage} alt={product.productName} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                : '-'
              }
            </td>
            <td>{product.productName}</td>
            <td>{product.productPrice.toLocaleString()}원</td>
            <td>{product.productStock}</td>
            <td>{product.salesCount}</td>
            <td>
              <span className={product.productStatus === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}>
                {product.productStatus === 'ACTIVE' ? '판매중' : '판매중지'}
              </span>
            </td>
            <td>
              <div className={styles.btnArea}>
                <Button variant='primary' size='small' onClick={() => handleEdit(product.productId)}>수정</Button>
                <Button variant='danger' size='small' onClick={() => handleDelete(product.productId)}>삭제</Button>
              </div>
            </td>
          </>
        )}
      />
      </div>
    </div>
  )
}

export default Products
