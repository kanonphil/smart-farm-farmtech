import React, { useEffect, useRef, useState } from 'react'
import { getCategory, regProductAPI } from '../../api/product/product';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './ProductRegister.module.css';
import Select from '../../components/common/Select';
import useAuthStore from '../../store/authStore';
import PageTitle from '../../components/common/PageTitle';
import { uploadImageToS3 } from '../../api/product/upload';

/**
 * 상품 등록 페이지
 * - 대표/서브/상세페이지 이미지 업로드 (클릭형 프리뷰 UI)
 * - 필수 항목 유효성 검사
 * - 등록 성공/실패 인라인 메시지 처리
 */
const ProductRegister = () => {
  //카테고리 저장 데이터
  const [cateList, setCateList] = useState([]);
 
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

  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errors, setErrors] = useState({})

  const mainInputRef = useRef()
  const subInputRef = useRef()
  const detailInputRef = useRef()

  useEffect(()=>{
    getCategory()
      .then(res => setCateList(res.data))
      .catch(err => console.error('[카테고리] 조회 실패', err))
  },[])

  /** 텍스트 필드 변경 핸들러 */
  const handleProductData = (e) => {
    const {value, name} = e.target;
    setProductData(prev => ({
      ...prev,
      [name] : value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /** 대표 이미지 선택 */
  const handleMainImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMainImg(file)
    setmainImgPreviews(URL.createObjectURL(file))
    if (errors.mainImg) setErrors(prev => ({ ...prev, mainImg: '' }))
  }

  /** 서브 이미지 선택 (다중) */
  const handleSubImgs = (e) => {
    const files = Array.from(e.target.files)
    setSubImgs(files)
    setSubImgsPreviews(files.map(f => URL.createObjectURL(f)))
  }

  /** 상세페이지 이미지 선택 */
  const handleDetailImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setdetailImgs(file)
    setDetailPreviews(URL.createObjectURL(file))
  }

  /** 필수 항목 유효성 검사 */
  const validate = () => {
    const newErrors = {}
    if (!productData.productName.trim()) newErrors.productName = '상품명을 입력해주세요'
    if (!productData.productPrice) newErrors.productPrice = '가격을 입력해주세요'
    if (!productData.productStock) newErrors.productStock = '재고를 입력해주세요'
    if (!productData.categoryId) newErrors.categoryId = '카테고리를 선택해주세요'
    if (!productData.productStatus) newErrors.productStatus = '상품 상태를 선택해주세요'
    if (!mainImg) newErrors.mainImg = '대표 이미지를 선택해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /** 폼 초기화 */
  const resetForm = () => {
    setProductData({
      productName: '',
      productPrice: '',
      productStock: '',
      productDesc: '',
      productStatus: '',
      categoryId: ''
    })
    setMainImg(null)
    setSubImgs(null)
    setdetailImgs(null)
    setmainImgPreviews(null)
    setSubImgsPreviews([])
    setDetailPreviews(null)
    mainInputRef.current.value = ''
    subInputRef.current.value = ''
    detailInputRef.current.value = ''
  }

  //상품등록 버튼 클릭 시 실행 함수
  const regProducts = async() => {
    if (!validate()) return


    try {
      const mainImgUrl = await uploadImageToS3(mainImg);
      const subImgUrls = await Promise.all(subImgs.map(uploadImageToS3));
      const detailImgUrl = detailImg ? await uploadImageToS3(detailImg) : null;

      const response = await regProductAPI(productData,mainImgUrl,subImgUrls,detailImgUrl);
      if(response.status === 201){
        setSubmitStatus('success')
        resetForm()
        setTimeout(() => setSubmitStatus(null),3000)
      }
    } catch (error) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 3000)
    }
  }


  return (
    <div className={styles.container}>
      <PageTitle title='상품 등록' />

      {/* 성공/실패 메시지 */}
      {submitStatus === 'success' && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          상품이 성공적으로 등록되었습니다.
        </div>
      )}
      {submitStatus === 'error' && (
        <div className={`${styles.toast} ${styles.toastError}`}>
          상품 등록에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <div className={styles.layout}>
        {/* 좌측 - 이미지 영역 */}
        <div className={styles.imageCol}>

          {/* 대표 이미지 */}
          <div className={styles.imgSection}>
            <p className={styles.imgLabel}>
              대표 이미지 <span className={styles.required}>*</span>
            </p>
            <div
              className={`${styles.uploadBox} ${styles.mainBox} ${errors.mainImg ? styles.uploadBoxError : ''}`}
              onClick={() => mainInputRef.current.click()}
            >
              {mainImgPreviews
                ? <img src={mainImgPreviews} alt='대표 이미지' className={styles.previewImg} />
                : <div className={styles.placeholder}>
                    <span className={styles.uploadIcon}>+</span>
                    <span>클릭하여 이미지 선택</span>
                  </div>
              }
            </div>
            {errors.mainImg && <span className={styles.errorMsg}>{errors.mainImg}</span>}
            <input ref={mainInputRef} type='file' accept='image/*' hidden onChange={handleMainImg} />
          </div>

          {/* 서브 이미지 */}
          <div className={styles.imgSection}>
            <p className={styles.imgLabel}>서브 이미지 <span className={styles.optional}>(선택)</span></p>
            <div className={styles.uploadBox} onClick={() => subInputRef.current.click()}>
              {subImgsPreviews.length > 0
                ? <div className={styles.subGrid}>
                    {subImgsPreviews.map((url, i) => (
                      <img key={i} src={url} alt={`서브${i + 1}`} className={styles.subPreviewImg} />
                    ))}
                  </div>
                : <div className={styles.placeholder}>
                    <span className={styles.uploadIcon}>+</span>
                    <span>여러 장 선택 가능</span>
                  </div>
              }
            </div>
            <input ref={subInputRef} type='file' accept='image/*' multiple hidden onChange={handleSubImgs} />
          </div>

          {/* 상세페이지 이미지 */}
          <div className={styles.imgSection}>
            <p className={styles.imgLabel}>상세페이지 이미지 <span className={styles.optional}>(선택)</span></p>
            <div className={styles.uploadBox} onClick={() => detailInputRef.current.click()}>
              {detailPreviews
                ? <img src={detailPreviews} alt='상세페이지' className={styles.previewImg} />
                : <div className={styles.placeholder}>
                    <span className={styles.uploadIcon}>+</span>
                    <span>클릭하여 이미지 선택</span>
                  </div>
              }
            </div>
            <input ref={detailInputRef} type='file' accept='image/*' hidden onChange={handleDetailImg} />
          </div>

        </div>

        {/* 우측 - 폼 영역 */}
        <div className={styles.formCol}>
          <Input
            label='상품명'
            name='productName'
            value={productData.productName}
            onChange={handleProductData}
            placeholder='상품명을 입력해주세요'
            required
            error={errors.productName}
          />

          <div className={styles.row}>
            <Input
              label='가격'
              name='productPrice'
              type='number'
              value={productData.productPrice}
              onChange={handleProductData}
              placeholder='0'
              required
              error={errors.productPrice}
            />
            <Input
              label='재고'
              name='productStock'
              type='number'
              value={productData.productStock}
              onChange={handleProductData}
              placeholder='0'
              required
              error={errors.productStock}
            />
          </div>

          <div className={styles.row}>
            <Select
              label='카테고리'
              name='categoryId'
              value={productData.categoryId}
              onChange={handleProductData}
              options={cateList.map(c => ({ value: c.categoryId, label: c.categoryName }))}
              placeholder='카테고리 선택'
              required
              error={errors.categoryId}
            />
            <Select
              label='상품 상태'
              name='productStatus'
              value={productData.productStatus}
              onChange={handleProductData}
              options={[
                { value: 'ACTIVE',   label: '판매중'   },
                { value: 'INACTIVE', label: '판매중지' },
              ]}
              placeholder='상태 선택'
              required
              error={errors.productStatus}
            />
          </div>

          {/* 상품 설명 (Input 컴포넌트가 textarea 미지원으로 직접 사용) */}
          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>상품 설명</label>
            <textarea
              name='productDesc'
              value={productData.productDesc}
              onChange={handleProductData}
              placeholder='상품 설명을 입력해주세요'
              className={styles.textarea}
              rows={8}
            />
          </div>

          <Button fullWidth onClick={regProducts}>
            상품 등록
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductRegister