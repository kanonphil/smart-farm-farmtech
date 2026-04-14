import { useEffect, useState, useMemo } from 'react'
import styles from './ReviewManage.module.css'
import useAuthStore from '../../store/authStore'
import { axiosInstance } from '../../api/axiosInstance'
import { MdAutoAwesome, MdDelete,  MdVisibility, MdVisibilityOff } from 'react-icons/md'
import Table from '../../components/common/Table'
import { getReplyByReviewId, saveReply, deleteReply, generateReplyDraft } from '../../api/reviewApi'
import Modal from '../../components/common/Modal'

/**
 * 매니저 리뷰 관리 페이지
 *
 * 전체 리뷰 목록 조회, 삭제, 블라인드 처리,
 * Gemini AI 악플 분석(CLEAN/SUSPICIOUS/TOXIC) 기능을 제공한다.
 * 정렬 기준: 최신순(기본) / AI 등급순(TOXIC→SUSPICIOUS→CLEAN)
 */
const ReviewManage = () => {
  const { showAlert } = useAuthStore()

  /** 전체 리뷰 목록 */
  const [reviews, setReviews] = useState([])
  /** 답글 모달 상태 */
  const [replyModal, setReplyModal] = useState({ open: false, review: null, replyId: null, content: '' })
  /** AI 초안 생성 중 여부 */
  const [drafting, setDrafting] = useState(false)
  /** AI 분석 요청 중 여부 */
  const [analyzing, setAnalyzing] = useState(false)
  /** 정렬 기준: 'date' | 'aiLabel' */
  const [sortBy, setSortBy] = useState('date')

  /** AI 등급 정렬 우선순위 (낮을수록 앞) */
  const AI_LABEL_ORDER = { TOXIC: 0, SUSPICIOUS: 1, CLEAN: 2 }

  /** 정렬 적용된 리뷰 목록 */
  const sortedReviews = useMemo(() => {
    const copy = [...reviews]
    if (sortBy === 'date') {
      // 최신순
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    if (sortBy === 'aiLabel') {
      // 악플 → 의심 → 정상, AI 등급 없으면 맨 뒤
      return copy.sort((a, b) => {
        const aOrder = AI_LABEL_ORDER[a.aiLabel] ?? 99
        const bOrder = AI_LABEL_ORDER[b.aiLabel] ?? 99
        if (aOrder !== bOrder) return aOrder - bOrder
        // 같은 등급이면 최신순
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }
    return copy
  }, [reviews, sortBy])

  /** 전체 리뷰 목록 조회 */
  const fetchReviews = async () => {
    const res = await axiosInstance.get('/reviews/manager')
    setReviews(res.data)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  /** 리뷰 삭제 */
  const handleDelete = async (reviewId) => {
    await axiosInstance.delete(`/reviews/manager/${reviewId}`)
    setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
  }

  /** 블라인드 / 복구 토글 */
  const handleToggleStatus = async (review) => {
    const next = review.status === 'VISIBLE' ? 'BLINDED' : 'VISIBLE'
    await axiosInstance.patch(`/reviews/manager/${review.reviewId}/status`, { status: next })
    setReviews(prev => prev.map(r =>
      r.reviewId === review.reviewId ? { ...r, status: next } : r
    ))
  }

  /** Gemini AI 분석 요청 */
  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const res = await axiosInstance.post('/reviews/manager/analyze')
      // const labelMap = Object.fromEntries(res.data.map(r => [r.reviewId, r.aiLabel]))
      // setReviews(prev => prev.map(r => ({ ...r, aiLabel: labelMap[r.reviewId] ?? r.aiLabel })))
      // aiLabel + TOXIC 자동 블라인드 status 동시 반영
      const resultMap = Object.fromEntries(
        res.data.map(r => [r.reviewId, { aiLabel: r.aiLabel, status: r.status }])
      )
      setReviews(prev => prev.map(r => ({
        ...r,
        aiLabel: resultMap[r.reviewId]?.aiLabel ?? r.aiLabel,
        status:  resultMap[r.reviewId]?.status  ?? r.status,
      })))
      // 분석 완료 후 AI 등급순으로 자동 전환
      setSortBy('aiLabel')
    } catch (e) {
      showAlert('AI 분석 중 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  /** 답글 모달 열기 - 기존 답글 조회 후 표시 */
  const handleOpenReply = async (review) => {
    try {
      const res = await getReplyByReviewId(review.reviewId)
      const existing = res.data
      setReplyModal({
        open: true,
        review,
        replyId: existing?.replyId ?? null,
        content: existing?.content ?? '',
      })
    } catch (error) {
      showAlert('답글 정보를 불러오지 못했습니다.')
    }
    
  }

  /** 답글 저장 */
  const handleSaveReply = async () => {
    try {
      await saveReply(replyModal.review.reviewId, replyModal.content)
      // 저장 후 해당 리뷰 hasReply → true 반영
      setReviews(prev => prev.map(r =>
        r.reviewId === replyModal.review.reviewId ? { ...r, hasReply: true } : r
      ))
      setReplyModal({ open: false, review: null, replyId: null, content: '' })
    } catch {
      showAlert('답글 저장에 실패했습니다.')
    }
  }

  /** 답글 삭제 */
  const handleDeleteReply = async () => {
    try {
      await deleteReply(replyModal.review.reviewId, replyModal.replyId)
      // 삭제 후 해당 리뷰 hasReply → false 반영
      setReviews(prev => prev.map(r =>
        r.reviewId === replyModal.review.reviewId ? { ...r, hasReply: false } : r
      ))
      setReplyModal({ open: false, review: null, replyId: null, content: '' })
    } catch {
      showAlert('답글 삭제에 실패했습니다.')
    }
  }

  /** Gemini AI 초안 생성 */
  const handleDraft = async () => {
    setDrafting(true)
    try {
      const res = await generateReplyDraft(
        replyModal.review.reviewId,
        replyModal.review.rating,
        replyModal.review.content
      )
      setReplyModal(prev => ({ ...prev, content: res.data.draft }))
    } catch {
      showAlert('AI 초안 생성 중 오류가 발생했습니다.')
    } finally {
      setDrafting(false)
    }
  }


  /** AI 등급 뱃지 */
  const labelBadge = (label) => {
    if (!label) return '-'
    const map = {
      CLEAN:      { text: '정상', cls: styles.labelClean },
      SUSPICIOUS: { text: '의심', cls: styles.labelSuspicious },
      TOXIC:      { text: '악플', cls: styles.labelToxic },
    }
    const { text, cls } = map[label] ?? { text: label, cls: '' }
    return <span className={`${styles.label} ${cls}`}>{text}</span>
  }

  /** 공통 Table 헤더 */
  const headers = [[
    { label: '상품명',  style: { width: '140px' } },
    { label: '작성자',  style: { width: '90px'  } },
    { label: '별점',    style: { width: '100px' } },
    { label: '내용',    style: { width: 'auto'  } },
    { label: '날짜',    style: { width: '100px' } },
    { label: '상태',    style: { width: '80px'  } },
    { label: 'AI 등급', style: { width: '80px'  } },
    { label: '답글',    style: { width: '60px'  } },
    { label: '관리',    style: { width: '80px'  } },
  ]]

  /** 공통 Table 행 렌더 */
  const renderRow = (review) => (
    <>
      <td>{review.productName}</td>
      <td>{review.memberName}</td>
      <td>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</td>
      <td className={styles.content} title={review.content}>{review.content}</td>
      <td>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</td>
      <td>
        <span className={review.status === 'VISIBLE' ? styles.statusVisible : styles.statusBlinded}>
          {review.status === 'VISIBLE' ? '정상' : '블라인드'}
        </span>
      </td>
      <td>{labelBadge(review.aiLabel)}</td>
      <td>
        <button
          className={`${styles.replyBtn} ${review.hasReply ? styles.replyBtnHas : ''}`}
          onClick={() => handleOpenReply(review)}
          title={review.hasReply ? '답글 수정' : '답글 작성'}
        >
          {review.hasReply ? '수정' : '작성'}
        </button>
      </td>

      <td>
        <div className={styles.actions}>
          <button
            className={styles.blindBtn}
            onClick={() => handleToggleStatus(review)}
            title={review.status === 'VISIBLE' ? '블라인드' : '복구'}
          >
            {review.status === 'VISIBLE' ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDelete(review.reviewId)}
            title='삭제'
          >
            <MdDelete />
          </button>
        </div>
      </td>
    </>
  )

  /** 블라인드 행은 흐리게 */
  const getRowClass = (review) => review.status === 'BLINDED' ? styles.blinded : ''

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>리뷰 관리</h2>

        <div className={styles.controls}>
          {/* 정렬 선택 */}
          <div className={styles.sortWrap}>
            <button
              className={`${styles.sortBtn} ${sortBy === 'date' ? styles.sortActive : ''}`}
              onClick={() => setSortBy('date')}
            >
              최신순
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'aiLabel' ? styles.sortActive : ''}`}
              onClick={() => setSortBy('aiLabel')}
            >
              AI 등급순
            </button>
          </div>

          {/* AI 분석 */}
          <button
            className={styles.analyzeBtn}
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            <MdAutoAwesome />
            {analyzing ? 'AI 분석 중...' : 'AI 악플 분석'}
          </button>
        </div>
      </div>

      <Table
        headers={headers}
        data={sortedReviews}
        renderRow={renderRow}
        getRowClass={getRowClass}
        emptyMessage='리뷰가 없습니다.'
      />

      {replyModal.open && (
        <Modal
          isOpen={true}
          onClose={() => setReplyModal({ open: false, review: null, replyId: null, content: '' })}
          width="520px"
        >
          <div className={styles.replyModal}>
            <h3 className={styles.replyTitle}>매니저 답글</h3>

            {/* 원본 리뷰 요약 */}
            <div className={styles.replyReviewBox}>
              <span className={styles.replyProductName}>{replyModal.review?.productName}</span>
              <span className={styles.replyStars}>
                {'★'.repeat(replyModal.review?.rating)}{'☆'.repeat(5 - replyModal.review?.rating)}
              </span>
              <p className={styles.replyReviewContent}>{replyModal.review?.content}</p>
            </div>

            {/* 답글 입력 */}
            <textarea
              className={styles.replyTextarea}
              value={replyModal.content}
              onChange={e => setReplyModal(prev => ({ ...prev, content: e.target.value }))}
              placeholder="답글을 입력하세요..."
              rows={4}
            />

            {/* 버튼 영역 */}
            <div className={styles.replyFooter}>
              <button className={styles.draftBtn} onClick={handleDraft} disabled={drafting}>
                <MdAutoAwesome />
                {drafting ? 'AI 초안 생성 중...' : 'AI 초안 생성'}
              </button>
              <div className={styles.replyBtns}>
                {replyModal.replyId && (
                  <button className={styles.deleteBtn} onClick={handleDeleteReply}>삭제</button>
                )}
                <button
                  className={styles.saveBtn}
                  onClick={handleSaveReply}
                  disabled={!replyModal.content.trim()}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default ReviewManage
