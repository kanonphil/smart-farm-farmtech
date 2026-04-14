import React, { useEffect, useState } from 'react'
import styles from './Reviews.module.css'
import { deleteReview, getMyReviews, getReplyByReviewId, getUnreviewedItems, insertReview, updateReview } from '../../api/reviewApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Input from '../../components/common/Input'
import useAuthStore from '../../store/authStore'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'
import Button from '../../components/common/Button'

const Reviews = () => {
  const nav = useNavigate();
  const { token, showAlert } = useAuthStore() 
  const [searchParams] = useSearchParams()

  //조회 시작 날짜 저장변수
  const[startDate, setStartDate] = useState('')
  //조회 엔드 날짜 저장변수
  const[endDate, setEndDate] = useState('')
  //현재 액티브되고있는 날짜버튼 저장변수
  const[activeBtn, setActiveBtn] = useState(30)
  //현재 액티브되고있는 탭 저장 변수
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'unwritten')
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
  // 작성완료 리뷰별 답글 저장 { [reviewId]: replyContent }
  const [replyMap, setReplyMap] = useState({})
  // 알림으로 진입 시 하이라이트할 reviewId
  const [highlightId, setHighlightId] = useState(
    Number(searchParams.get('reviewId')) || null
  )

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

    // 작성완료 리뷰 답글 일괄 조회
    const replies = await Promise.all(
      myReviews.data.map(r => 
        getReplyByReviewId(r.reviewId).catch(() => null)
      )
    )
    const map = {}
    myReviews.data.forEach((r, i) => {
      if (replies[i]?.data?.content) {
        map[r.reviewId] = replies[i].data.content
      }
    })
    setReplyMap(map)
  }

  // 렌더링 시 기간 1개월로 설정
  useEffect(()=>{
    handlePeriod(30)
  }, [])

  // 날짜 변경 시 데이터 재조회
  useEffect(() => {
    if (startDate && endDate && token) fetchData()
  }, [startDate, endDate, token])

  // searchParams 변경 시 탭 전환 (알림 클릭으로 이동 시)
  useEffect(() => {
    const tab = searchParams.get('tab')
    const reviewId = searchParams.get('reviewId')
    if (tab) setActiveTab(tab)
    if (reviewId) setHighlightId(Number(reviewId))
  }, [searchParams])
  
  // 아코디언 열기/닫기 (같은 항목 클릭 시 닫힘)
  const handleAccordion = async (id, isWritten = false) => {
    setOpenId(prev => prev === id ? null : id)
    setReviewForm({ rating: 0, content: '' })
    setReviewImage(null)
    setPreview(null)

    // 작성완료 탭에서 아코디언 열 때만 답글 조회
    if (isWritten && !replyMap[id]) {
      try {
        const res = await getReplyByReviewId(id)
        if (res.data?.content) {
          setReplyMap(prev => ({ ...prev, [id]: res.data.content }))
        }
      } catch { /* 답글 없으면 무시 */ }
    }
  }

  /** 리뷰 등록 */
  const handleSubmit = async (orderItemId) => {
    if (reviewForm.rating === 0) { showAlert('별점을 선택해주세요'); return }
    if (!reviewForm.content.trim()) { showAlert('내용을 입력해주세요'); return }
    const formData = new FormData()
    formData.append('orderItemId', orderItemId)
    formData.append('rating', reviewForm.rating)
    formData.append('content', reviewForm.content)
    if (reviewImage) formData.append('imgFile', reviewImage)
    await insertReview(formData)
    showAlert('리뷰가 등록되었습니다.')
    setOpenId(null)
    fetchData()
  }

  /** 리뷰 수정 */
  const handleUpdate = async (reviewId) => {
    if (editForm.rating === 0) { showAlert('별점을 선택해주세요'); return }
    if (!editForm.content.trim()) { showAlert('내용을 입력해주세요'); return }
    await updateReview(reviewId, { rating: editForm.rating, content: editForm.content, imgFile: editImage })
    showAlert('수정되었습니다.')
    setEditId(null)
    fetchData()
  }

  // 리뷰 삭제
  const handleDelete = async (reviewId) => {
    const result = window.confirm('리뷰를 삭제하시겠습니까?')
    if (!result) return
    await deleteReview(reviewId)
    showAlert('삭제되었습니다.')
    fetchData()
  }

  /** 별점 렌더 헬퍼 */
  const renderStars = (rating, onSelect) => (
    <div className={styles.star_div}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= rating ? styles.star_on : styles.star_off}
          onClick={() => onSelect?.(star)}
          style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >★</span>
      ))}
    </div>
  )

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>리뷰 관리</h2>
        <p className={styles.pageSubtitle}>작성한 리뷰를 확인하고 수정할 수 있습니다.</p>
      </div>

      {/* 기간 필터 */}
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
          <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.dateInput} />
          <span className={styles.dateSeparator}>~</span>
          <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.dateInput} />
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tab_div}>
        <button
          className={`${styles.tab} ${activeTab === 'unwritten' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('unwritten')}
        >
          미작성 리뷰 ({unwrittenList.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'written' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('written')}
        >
          작성 완료 ({writtenList.length})
        </button>
      </div>

      {/* 미작성 리뷰 목록 */}
      {activeTab === 'unwritten' && (
        <div className={styles.list}>
          {unwrittenList.length === 0 && <p className={styles.empty}>미작성 리뷰가 없습니다.</p>}
          {unwrittenList.map(item => (
            <div key={item.orderItemId} className={`${styles.accordion_item} ${openId === item.orderItemId ? styles.accordion_open : ''}`}>
              <div className={styles.accordion_header} onClick={() => handleAccordion(item.orderItemId)}>
                {item.imageSavedName && <img src={item.imageSavedName} className={styles.product_thumb} />}
                <div className={styles.header_info}>
                  <p className={styles.product_name}>{item.productName}</p>
                  <p className={styles.order_date}>{item.orderDate?.split('T')[0]}</p>
                </div>
                {openId === item.orderItemId ? <MdExpandLess size={20} className={styles.chevron} /> : <MdExpandMore size={20} className={styles.chevron} />}
              </div>

              {openId === item.orderItemId && (
                <div className={styles.accordion_body}>
                  <div className={styles.star_preview_row}>
                    {renderStars(reviewForm.rating, (star) => setReviewForm(prev => ({ ...prev, rating: star })))}
                    <div className={styles.review_preview}>
                      {preview
                        ? <img src={preview} className={styles.review_preview_img} />
                        : <span className={styles.review_preview_placeholder}>미리보기</span>
                      }
                    </div>
                  </div>
                  <textarea
                    placeholder='리뷰를 작성해주세요'
                    value={reviewForm.content}
                    onChange={e => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    className={styles.textarea}
                  />
                  <div className={styles.file_row}>
                    <Input type='file' accept='image/*' onChange={e => {
                      const file = e.target.files[0]
                      setReviewImage(file)
                      setPreview(file ? URL.createObjectURL(file) : null)
                    }} />
                    <Button size='small' onClick={() => handleSubmit(item.orderItemId)}>등록하기</Button>
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
          {writtenList.length === 0 && <p className={styles.empty}>작성된 리뷰가 없습니다.</p>}
          {writtenList.map(item => (
            <div
              key={item.reviewId}
              className={`
                ${styles.accordion_item}
                ${openId === item.reviewId ? styles.accordion_open : ''}
                ${highlightId === item.reviewId ? styles.accordion_hasReply : ''}
              `}
            >
              <div className={styles.accordion_header} onClick={() => handleAccordion(item.reviewId, true)}>
                {item.imageUrl && <img src={item.imageUrl} className={styles.product_thumb} />}
                <div className={styles.header_info}>
                  <p className={styles.product_name}>{item.productName}</p>
                  <p className={styles.order_date}>{item.createdAt?.split('T')[0]}</p>
                </div>
                <div className={styles.header_rating}>{'★'.repeat(item.rating)}</div>

                {/* 답글 뱃지 */}
                {replyMap[item.reviewId] && (
                  <span className={styles.replyBadge}>답글</span>
                )}

                {openId === item.reviewId ? <MdExpandLess size={20} className={styles.chevron} /> : <MdExpandMore size={20} className={styles.chevron} />}
              </div>

              {openId === item.reviewId && (
                <div className={styles.accordion_body}>
                  {/* 상품 링크 */}
                  <div className={styles.product_link} onClick={() => nav(`/products/${item.productId}`)}>
                    <p>{item.productName}</p>
                    <span>상품 보러가기 →</span>
                  </div>

                  {editId === item.reviewId ? (
                    /* 수정 모드 */
                    <>
                      <div className={styles.star_preview_row}>
                        {renderStars(editForm.rating, (star) => setEditForm(prev => ({ ...prev, rating: star })))}
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
                        <Input type='file' accept='image/*' onChange={e => {
                          const file = e.target.files[0]
                          setEditPreview(file ? URL.createObjectURL(file) : null)
                          setEditImage(file)
                        }} />
                        <div className={styles.btn_row}>
                          <Button size='small' onClick={() => handleUpdate(item.reviewId)}>저장</Button>
                          <Button size='small' variant='secondary' onClick={() => { setEditId(null); setEditImage(null); setEditPreview(null) }}>취소</Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 조회 모드 */
                    <>
                      <p className={styles.review_content}>{item.content}</p>

                      {/* 판매자 답글 */}
                      {replyMap[item.reviewId] && (
                        <div className={styles.replyBox}>
                          <span className={styles.replyLabel}>판매자 답글</span>
                          <p className={styles.replyContent}>{replyMap[item.reviewId]}</p>
                        </div>
                      )}

                      <div className={styles.btn_row}>
                        <Button size='small' variant='secondary' onClick={() => { setEditId(item.reviewId); setEditForm({ rating: item.rating, content: item.content }) }}>수정</Button>
                        <Button size='small' variant='danger' onClick={() => handleDelete(item.reviewId)}>삭제</Button>
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
