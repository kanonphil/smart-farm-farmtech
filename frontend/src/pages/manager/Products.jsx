import React, { useEffect, useState } from 'react'
import { delProduct, getCategory, getProductListManager, putProduct } from '../../api/product/product';
import styles from './Products.module.css'
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const nav = useNavigate();
  //상품 조회
  const [products, setProducts] = useState([]);
  //카테고리 조회
  const [categories, setCategories] = useState([]);

  //모달
  const [isModalOpen, setIsModalOpen] = useState(false); // 열고 닫음
  const [selectProduct, setSelectProduct] = useState();  //선택된 상품
  const [form, setForm] = useState({
    categoryId : '',
    productName : '',
    productPrice : 0,
    productStock : 0,
    productStatus : 'ACTIVE'
  });
  
  //수정 시 변수 저장
  const handleFormChange = e => {
    const {name, value} = e.target;
    setForm(prev => ({...prev, [name] : value}));
  }

  //수정 완료 시 전달 api 전달함수
  const handleSave = async() => {
   await putProduct(selectProduct.productId, form);
   setIsModalOpen(false);
   fetchProducts();
   alert("수정이 완료되었습니다");
  }
  
  //모달창에서 상태값
  const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: '판매중' },
    { value: 'INACTIVE', label: '판매중지' },
  ];

  //상품리스트
  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, []);

  //모달
  useEffect(() => {
      if(selectProduct){
        setForm({
          categoryId : selectProduct.categoryId,
          productName : selectProduct.productName,
          productPrice : selectProduct.productPrice,
          productStock : selectProduct.productStock,
          productStatus : selectProduct.productStatus
        })
      }
  },[selectProduct])

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
  //수정핸들러
  const handleEdit = (product) => {
    setIsModalOpen(true);
    setSelectProduct(product);
  }
  //삭제핸들러
  const handleDelete = async(productId) => {
    const ok = confirm("정말 삭제하시겠습니까?")
    if(!ok) return;
    await delProduct(productId);
    fetchProducts();
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
        <Button
          variant='primary'
          size='small'
          onClick={() => nav('/manager/reg-product')}
        >+ 상품 등록</Button>
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
                <Button
                  variant='primary'
                  size='small'
                  onClick={(e) => handleEdit(product)}>수정</Button>
                <Button 
                  variant='danger' 
                  size='small' 
                  onClick={(e) => handleDelete(product.productId)}>삭제</Button>
              </div>
            </td>
          </>
        )}
      />
      </div>
      {/* 수정 시 모달창 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="상품 수정"
        width='500px'
        className={styles.darkModal}
      >
       {/* 수정 폼 */}
       <div className={styles.editForm}>
          <Select
            label="카테고리"
            name='categoryId'
            value={form.categoryId}
            onChange={handleFormChange}
            options={categories.map(e => ({ value: e.categoryId, label: e.categoryName }))}
          />
          <Input
            label="상품명"
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleFormChange}
          />
          <Input
            label="가격"
            type="number"
            name="productPrice"
            value={form.productPrice}
            onChange={handleFormChange}
          />
          <Input
            label="재고"
            type="number"
            name="productStock"
            value={form.productStock}
            onChange={handleFormChange}
          />
          <Select
            label="상태"
            name="productStatus"
            value={form.productStatus}
            onChange={handleFormChange}
            options={STATUS_OPTIONS}
          />
          <div className={styles.formActions}>
            <Button
              variant='outline'
              size='small'
              onClick={() => setIsModalOpen(false)}
            >취소</Button>
            <Button
              variant='primary'
              size='small'
              onClick={handleSave}
            >저장</Button>
          </div>
       </div>
      </Modal>
    </div>
  )
}

export default Products
