import React, { useEffect, useState } from 'react'
import styles from './Reviews.module.css'
import { deleteReview, getMyReviews, getUnreviewedItems, insertReview, updateReview } from '../../api/reviewApi'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'

const Reviews = () => {
    const nav = useNavigate();
    //조회 시작 날짜 저장변수
    const[startDate, setStartDate] = useState('')
    //조회 엔드 날짜 저장변수
    const[endDate, setEndDate] = useState('')
    //현재 액티브되고있는 날짜버튼 저장변수
    const[activeBtn, setActiveBtn] = useState(30)
    //현재 액티브되고있는 탭 저장 변수
    const [activeTab, setActiveTab] = useState('unwritten')
    //열린 아코디언 id
    const [openId, setOpenId] = useState(null)
    // 미작성 리뷰 목록
    const [unwrittenList, setUnwrittenList] = useState([])
    // 작성완료 리뷰 목록
    const [writtenList, setWrittenList] = useState([])
    
    const [reviewForm, setReviewForm] = useState({ rating: 0, content: '' })
    // 리뷰 이미지 파일 + 미리보기 (등록)
    const [reviewImage, setReviewImage] = useState(null)
    const [preview, setPreview] = useState(null)
    // 수정 모드 여부 (reviewId 저장)
    const [editId, setEditId] = useState(null)
    // 수정 입력값
    const [editForm, setEditForm] = useState({ rating: 0, content: '' })
    // 수정 시 이미지 편집,프리뷰
    const [editImage,setEditImage] = useState();
    const [editPreview,setEditPreview] = useState();



    //버튼 클릭 시 날짜변경
    const handlePeriod = (days) => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - days)
      setEndDate(end.toISOString().split('T')[0])
      setStartDate(start.toISOString().split('T')[0])
      setActiveBtn(days)
    }
    
    // 미작성/작성완료 리뷰 동시 조회
    const fetchData = async () => {
      const [unreviewed, myReviews] = await Promise.all([
        getUnreviewedItems(startDate, endDate),
        getMyReviews(startDate, endDate)
      ])
      setUnwrittenList(unreviewed.data)
      setWrittenList(myReviews.data)
    }

    // 렌더링 시 기간 1개월로 설정
    useEffect(()=>{
      handlePeriod(30)
    }, [])

    // 날짜 변경 시 데이터 재조회
    useEffect(() => {
      if (startDate && endDate) fetchData()
    }, [startDate, endDate])
    
    // 아코디언 열기/닫기 (같은 항목 클릭 시 닫힘)
    const handleAccordion = (id) => {
      setOpenId(prev => prev === id ? null : id)
      setReviewForm({ rating: 0, content: '' })
      setReviewImage(null)
      setPreview(null)
    }

    // 리뷰 등록 처리
    const handleSubmit = async (orderItemId) => {
      if (reviewForm.rating === 0) { alert('별점을 선택해주세요'); return }
      if (!reviewForm.content.trim()) { alert('내용을 입력해주세요'); return }
      await insertReview({ orderItemId, rating: reviewForm.rating, content: reviewForm.content })
      alert('리뷰가 등록되었습니다.')
      setOpenId(null)
      fetchData() // 등록 후 목록 갱신
    }

    // 리뷰 수정
    const handleUpdate = async (reviewId) => {
      if (editForm.rating === 0) { alert('별점을 선택해주세요'); return }
      if (!editForm.content.trim()) { alert('내용을 입력해주세요'); return }
      await updateReview(reviewId, { rating: editForm.rating, content: editForm.content })
      alert('수정되었습니다.')
      setEditId(null)
      fetchData()
    }

    // 리뷰 삭제
    const handleDelete = async (reviewId) => {
      const result = window.confirm('리뷰를 삭제하시겠습니까?')
      if (!result) return
      await deleteReview(reviewId)
      alert('삭제되었습니다.')
      fetchData()
    }
      
    console.log(writtenList)

 return (
    <div className={styles.container}>
      <h2>리뷰 관리</h2>

      {/* 기간 필터 + 날짜 직접 입력 */}
      <div className={styles.head}>
        <div className={styles.periodBtns}>
          {[
            { label: '1주일', days: 7 },
            { label: '15일', days: 15 },
            { label: '1개월', days: 30 },
            { label: '3개월', days: 90 },
            { label: '6개월', days: 180 },
          ].map(({ label, days }) => (
            <button
              key={days}
              className={`${styles.periodBtn} ${activeBtn === days ? styles.active : ''}`}
              onClick={() => handlePeriod(days)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.dateRange}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <span className={styles.dateSeparator}>~</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* 미작성/작성완료 탭 */}
      <div className={styles.tab_div}>
        <button
          className={`${styles.tab} ${activeTab === 'unwritten' ? styles.active : ''}`}
          onClick={() => setActiveTab('unwritten')}
        >
          미작성 리뷰 ({unwrittenList.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'written' ? styles.active : ''}`}
          onClick={() => setActiveTab('written')}
        >
          작성 완료 ({writtenList.length})
        </button>
      </div>

      {/* 미작성 리뷰 목록 */}
      {activeTab === 'unwritten' && (
        <div className={styles.list}>
          {unwrittenList.length === 0 && (
            <p className={styles.empty}>미작성 리뷰가 없습니다.</p>
          )}
          {unwrittenList.map(item => (
            <div key={item.orderItemId} className={styles.accordion_item}>
              {/* 아코디언 헤더 - 클릭 시 열기/닫기 */}
              <div
                className={styles.accordion_header}
                onClick={() => handleAccordion(item.orderItemId)}
              >
                <p>{item.productName}</p>
                <p>{item.orderDate?.split('T')[0]}</p>
                <span>{openId === item.orderItemId ? '▲' : '▼'}</span>
                {item.imageSavedName && (
                  <img src={item.imageSavedName} className={styles.product_thumb} />
                )}
              </div>

              {/* 아코디언 바디 - 별점 + 내용 입력 */}
              {openId === item.orderItemId && (
                <div className={styles.accordion_body}>
                  {/* 별점 + 이미지 프리뷰 */}
                  <div className={styles.star_preview_row}>
                    <div className={styles.star_div}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={star <= reviewForm.rating ? styles.star_on : styles.star_off}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        >★</span>
                      ))}
                    </div>
                    <div className={styles.review_preview}>
                      {preview
                        ? <img src={preview} className={styles.review_preview_img} />
                        : <span className={styles.review_preview_placeholder}>미리보기</span>
                      }
                    </div>
                  </div>
                  {/* 리뷰 내용 입력 */}
                  <textarea
                    placeholder='리뷰를 작성해주세요'
                    value={reviewForm.content}
                    onChange={e => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    className={styles.textarea}
                  />
                  <div className={styles.file_row}>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={e => {
                        const file = e.target.files[0]
                        setReviewImage(file)
                        setPreview(file ? URL.createObjectURL(file) : null)
                      }}
                    />
                    <button
                      className={styles.submit_btn}
                      onClick={() => handleSubmit(item.orderItemId)}
                    >
                      등록하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 작성완료 리뷰 목록 */}
      {activeTab === 'written' && (
        <div className={styles.list}>
          {writtenList.length === 0 && (
            <p className={styles.empty}>작성된 리뷰가 없습니다.</p>
          )}
          {writtenList.map(item => (
            <div key={item.reviewId} className={styles.accordion_item}>
              {/* 아코디언 헤더 */}
              <div
                className={styles.accordion_header}
                onClick={() => handleAccordion(item.reviewId)}
              >
                <p>{item.productName}</p>
                <p>{'★'.repeat(item.rating)}</p>
                <p>{item.createdAt?.split('T')[0]}</p>
                <span>{openId === item.reviewId ? '▲' : '▼'}</span>
              </div>

              {/* 아코디언 바디 - 리뷰 내용 표시 */}
              {openId === item.reviewId && (
                <div className={styles.accordion_body}>
                  {/* 상품 이동 링크 */}
                  <div
                    className={styles.product_link}
                    onClick={() => nav(`/products/${item.productId}`)}
                  >
                    <div>
                      {item.imageUrl &&
                      <img
                       src={item.imageUrl}
                       style={{
                        width:'50px',
                        height:'50px',
                        objectFit: 'cover',
                        borderRadius :'4px'
                       }}
                      />}
                    </div>
                    <p>{item.productName}</p>
                    <span>상품 보러가기 →</span>
                  </div>
            
                

                  {editId === item.reviewId ? (
                    /* 수정 모드 */
                    <>
                    <div className={styles.star_preview_row}>
                      <div className={styles.star_div}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={star <= editForm.rating ? styles.star_on : styles.star_off}
                            onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                          >★</span>
                        ))}
                      </div>
                      <div className={styles.review_preview}>
                        {editPreview
                          ? <img src={editPreview} className={styles.review_preview_img} />
                          : <span className={styles.review_preview_placeholder}>미리보기</span>
                        }
                      </div>
                    </div>
                      <textarea
                        value={editForm.content}
                        onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                        className={styles.textarea}
                      />
                      <div className={styles.file_row}>
                        <Input
                          type='file'
                          accept='image/*'
                          onChange={e => {
                            const file = e.target.files[0]
                            setEditPreview(file ? URL.createObjectURL(file):null);
                            setEditImage(file);
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className={styles.submit_btn}
                            onClick={() => handleUpdate(item.reviewId)}
                          >
                            저장
                          </button>
                          <button
                            className={styles.cancel_btn}
                            onClick={() => {
                              setEditId(null)
                              setEditImage(null)
                              setEditPreview(null)
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 조회 모드 */
                    <>
                      <p>{item.content}</p>
                      <div className={styles.btn_row}>
                        <button
                          className={styles.submit_btn}
                          onClick={() => {
                            setEditId(item.reviewId)
                            setEditForm({ rating: item.rating, content: item.content })
                          }}
                        >
                          수정
                        </button>
                        <button
                          className={styles.delete_btn}
                          onClick={() => handleDelete(item.reviewId)}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
