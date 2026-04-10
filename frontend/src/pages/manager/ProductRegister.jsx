import React, { useEffect, useState } from 'react'
import { getCategory, regProductAPI } from '../../api/product/product';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './ProductRegister.module.css';
import Select from '../../components/common/Select';
import useAuthStore from '../../store/authStore';


const ProductRegister = () => {
  //카테고리 저장 데이터
  const [cateList, setCateList] = useState([]);
  const { showAlert } = useAuthStore()
 
  //상품 저장 데이터
  const [productData,setProductData] = useState({
    productName : '',
    productPrice : 0,
    productStock : 0,
    productDesc : '',
    productStatus : '',
    categoryId : 1
  });

  //메인, 서브 이미지 저장할 변수
  const [mainImg, setMainImg] = useState(null);
  const [subImgs, setSubImgs] = useState([]);
  const [detailImg, setdetailImgs] = useState(null);

  //이미지 업로드 시 프리뷰 화면
  const [mainImgPreviews ,setmainImgPreviews] = useState(null);
  const [subImgsPreviews ,setSubImgsPreviews] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState(null);

  // 파일 input 초기화용 key (등록 성공 시 증가 → input 재마운트)
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(()=>{
    getCategoryData();
  },[])

  const handleProductData = (e) => {
    const {value, name} = e.target;
    setProductData(prev => ({
      ...prev,
      [name] : value
    }))
  }
  
  //카테고리 목록 조회 함수
  const getCategoryData = async() => {
    const response = await getCategory();
    setCateList(response.data);
    console.log(response.data);
  }
  //상품등록 버튼 클릭 시 실행 함수
  const regProducts = async() => {

     const regForm = new FormData();
     regForm.append('productName', productData.productName);
     regForm.append('productPrice',productData.productPrice);
     regForm.append('productStock',productData.productStock);
     regForm.append('productDesc',productData.productDesc);
     regForm.append('productStatus',productData.productStatus);
     regForm.append('categoryId',productData.categoryId);

     //메인 이미지 파일 정보 저장
     regForm.append('mainImg',mainImg);
     regForm.append('detailImg',detailImg);
     //서브 이미지 파일 정보 저장
     for(const e of subImgs){
      regForm.append('subImgs',e);
     }

    const response = await regProductAPI(regForm);
    if(response.status === 201){
      showAlert("등록 성공");

      //input 태그 초기화
      setProductData({
        productName : '',
        productPrice : 0,
        productStock : 0,
        productDesc : '',
        productStatus : '',
        categoryId : 1
      });

      //이미지 상태 초기화
      setMainImg(null);
      setSubImgs([]);
      setdetailImgs(null);
      setmainImgPreviews(null);
      setSubImgsPreviews([]);
      setDetailPreviews(null);
      setFileInputKey(prev => prev + 1); // 파일 input 실제 초기화
    }
  }


  return (
    <div className={styles.body}>
      <div className={styles.container}>
        
        <div className={styles.imgPreviewArea}>
          {/* 좌측 - 대표 이미지 */}
          <div className={styles.mainImgPre}>
            {mainImgPreviews && <img src={mainImgPreviews}/>}
          </div>
  
          {/* 가운데 - 서브 이미지들 */}
          <div className={styles.subImgsPre}>
            {subImgsPreviews && subImgsPreviews.map((url,i) => (
              <img key={i} src={url}/>
            ))}
          </div>
  
          {/* 우측 - 상세페이지 이미지 */}
          <div className={styles.detailImgPre}>
            {detailPreviews && <img src={detailPreviews}/>}
          </div>
        </div>
        
  
        <div className={styles.imageSelecter}>
          <div>
            <p>대표 이미지를 선택해주세요.</p>
            <Input
              key={`main-${fileInputKey}`}
              type='file'
              onChange={e => {
                setMainImg(e.target.files[0]);
                setmainImgPreviews(URL.createObjectURL(e.target.files[0]));//임시 생성 URL
              }}
            />
            
          </div>
          <div>
            <p>상세이미지를 선택해주세요. </p>
            
            <Input
                key={`sub-${fileInputKey}`}
                type='file'
                multiple={true}
                onChange={e => {
                  const filesArr = [];
  
                  for(let i = 0; i < e.target.files.length; i++){
                    filesArr.push(e.target.files[i])
                  }
                  setSubImgs(filesArr)
                  setSubImgsPreviews(filesArr.map(file => URL.createObjectURL(file)));
                }}
              />  
          </div>
          <div>
            <p>상세페이지 이미지를 선택해주세요.</p>
            <Input
              key={`detail-${fileInputKey}`}
              type='file'
              onChange={e => {
                setdetailImgs(e.target.files[0]);
                setDetailPreviews(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </div>
        </div>
  
        <div>
          {/* 상품명 */}
          <p>상품명</p>
          <Input
            name='productName'
            value={productData.productName}
            onChange={handleProductData}
          />
        </div>
  
        <div>
          <div>
            <p>가격</p>
            {/* 가격 */}
            <Input 
              name='productPrice'
              value={productData.productPrice}
              onChange={handleProductData}
            />
          </div>
          <div>
            <p>재고</p>
            {/* 재고 */}
            <Input
              name='productStock'
              value={productData.productStock}
              onChange={handleProductData}
            />
          </div>
        </div>
  
        <div>
          {/* 상품설명 */}
          <p>상품설명</p>
          <Input
            name='productDesc'
            type="textarea"
            value={productData.productDesc}
            onChange={handleProductData}
          />
        </div>
  
        <div>
          <p>카테고리</p>
          {/* 카테고리 선택 */}
          <Select
            name='categoryId'
            value={productData.categoryId}
            onChange={handleProductData}
            options={cateList.map(c => ({ value: c.categoryId, label: c.categoryName }))}
            placeholder='카테고리를 선택하세요'
          />
        </div>
  
        <div>
          <p>상품상태</p>
          {/* 상품상태 */}
          <Select
            name='productStatus'
            value={productData.productStatus}
            onChange={handleProductData}
            options={[
              { value: 'ACTIVE', label: '판매중' },
              { value: 'INACTIVE', label: '판매중지' }
            ]}
            placeholder='상품 상태를 선택하세요'
          />
        </div>
  
        <div>
          <Button
            type='button'
            title='도서등록'
            fullWidth
            onClick={regProducts}
          >
          상품등록  
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductRegister