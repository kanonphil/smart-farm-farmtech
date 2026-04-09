import React, { useEffect, useState } from 'react'
import styles from './UserReview.module.css'
import { getReviewRating, getReviews } from '../../api/reviewApi'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/common/Modal';

// SVG 별점 컴포넌트 (반개 지원)
const StarDisplay = ({ rating }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => {
        const full = i <= rating;
        const half = !full && i - 0.5 <= rating;
        const gradId = `star-${i}-${rating}`;

        return (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={full ? '100%' : half ? '50%' : '0%'} stopColor="#FF6B35" />
                <stop offset={full ? '100%' : half ? '50%' : '0%'} stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#${gradId})`}
            />
          </svg>
        );
      })}
      <span className={styles.ratingNum}>{rating}</span>
    </div>
  );
};


const UserReview = () => {
  const nav = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewRationg, setReviewRating] = useState({});
  const [selectedReview, setSelctedReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchReviewRatings();
  }, [])

  const fetchReviews = async () => {
    const response = await getReviews();
    setReviews(response.data)
  }

  const fetchReviewRatings = async () => {
    const response = await getReviewRating();
    setReviewRating(response.data);
  }

  console.log(reviews)
  return (
    <div className={styles.container}>

      <div className={styles.headerName}>
        <h3>상품리뷰</h3>
      </div>

      <div className={styles.reviews}>
        {reviews.map((r, i) => (
          <div key={i} className={styles.block} onClick={() => {setSelctedReview(r)}}
          >

            {/* 이미지 영역 */}
            {r.imageUrl ? (
              <div className={styles.overlapPoint}>
                <img
                  src={r.imageUrl}
                  className={styles.reviewImg}
                  onClick={e => {
                    
                  }}
                />
                <div className={styles.overlap}>포토리뷰</div>
              </div>
            ) : (
              <div className={styles.overlapPoint}>
                <img
                  src={r.imageSavedName}
                  className={styles.reviewImg}
                  onClick={e =>nav(`/products/${r.productId}`)}
                />
              </div>
            )}

            {/* 리뷰 내용 */}
            <div 
              className={styles.reviewsContent}
            >

              {/* 별점 + 이름 + 날짜 */}
              <div className={styles.metaRow}>
                <StarDisplay rating={r.rating} />
                <span className={styles.divider}>|</span>
                <span className={styles.memberName}>{r.memberName}</span>
                <span className={styles.createdAt}>{r.createdAt?.slice(0, 10)}</span>
              </div>

              {/* 리뷰 내용 */}
              <p className={styles.content}>{r.content}</p>

              {/* 상품명 클릭 */}
              <span
                className={styles.productNameClick}
                onClick={() => nav(`/products/${r.productId}`)}
              >
                {r.productName} →
              </span>

            </div>
          </div>
        ))}
      </div>
      {selectedReview &&(
        <Modal
          isOpen={true}
          onClose={() => {setSelctedReview(false)}}
          width="800px">
            <div className={styles.modalContainer}>
              <div>
                <img 
                  src={selectedReview.imageUrl || selectedReview.imageSavedName}
                  style={{ width: '480px', height: '480px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              <div style={{
                display:'flex',
                flexDirection:'column',
                gap:'10px'
              }}>
                <div>리뷰</div>
                    {selectedReview.productName}
                <div className={styles.modalHeader}>
                  <StarDisplay rating={selectedReview.rating}/>
                <div>{selectedReview.memberName}</div>
                  {selectedReview.createdAt}
                  <div>
                  </div>
                </div>
                <div>
                  {selectedReview.content}
                </div>
                <div>
                  <p>이 상품의 평균 평점</p>
                  {}
                  {}
                </div>
              </div>
            </div>
        </Modal>)
      }
      
    </div>
  )
}

export default UserReview
