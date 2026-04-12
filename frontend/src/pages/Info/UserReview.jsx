import React, { useEffect, useState } from 'react'
import styles from './UserReview.module.css'
import { getReviewRating, getReviews, getProductRating } from '../../api/reviewApi'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';

// SVG 별점 컴포넌트 (반개 지원)
const StarDisplay = ({ rating, size = 18 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => {
        const full = i <= rating;
        const half = !full && i - 0.5 <= rating;
        const gradId = `star-${i}-${rating}-${size}`;

        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
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
    </div>
  );
};


const UserReview = () => {
  const nav = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewRationg, setReviewRating] = useState({});
  const [selectedReview, setSelctedReview] = useState(false);
  const [productRating, setProductRating] = useState();
  const [filterRating, setFilterRating] = useState();
  const [searchType, setSearchType] = useState('productName');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const avgRating = Math.trunc((reviewRationg.AVG_RATING || 0) * 10) / 10;
  const avg30 = Math.trunc((reviewRationg.AVG_30RATING || 0) * 10) / 10;
  const avg7 = Math.trunc((reviewRationg.AVG_7RATING || 0) * 10) / 10;
  const total = reviewRationg.TOTAL || 0;

  // 별점 분포 계산
  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const pct = reviews.length > 0 ? Math.round(count / reviews.length * 100) : 0;
    return { star, count, pct };
  });

  const filteredReviews = reviews
    .filter(r => filterRating ? r.rating === filterRating : true)
    .filter(r => {
      if (!searchQuery) return true;
      if (searchType === 'productName') return r.productName?.includes(searchQuery);
      if (searchType === 'content') return r.content?.includes(searchQuery);
      return true;
    });

  const filterLabel = [
    filterRating && `${filterRating}점 필터 적용`,
    searchQuery && `"${searchQuery}" 검색 중`,
  ].filter(Boolean).join(', ');

  return (
    <div className={styles.container}>

      <div className={styles.headerName}>
        <h3>상품리뷰</h3>
      </div>

      {/* 검색 바 */}
      <div className={styles.searchBar}>
        <span className={styles.totalCount}>
          전체 <strong>{filteredReviews.length}</strong>건
          {filterLabel && <span className={styles.filterLabel}> ({filterLabel})</span>}
        </span>
        <div className={styles.searchRight}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
          >
            <option value="productName">상품명</option>
            <option value="content">후기내용</option>
          </select>
          <input
            className={styles.searchInput}
            placeholder="검색어 입력"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearchQuery(searchInput)}
          />
          <button className={styles.searchBtn} onClick={() => setSearchQuery(searchInput)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className={styles.statsSection}>

        {/* 평점 */}
        <div className={styles.statBox}>
          <p className={styles.statLabel}>평점</p>
          <StarDisplay rating={avgRating} size={26} />
          <div className={styles.statBig}>{avgRating}<span className={styles.statUnit}>/5</span></div>
          <div className={styles.statSubList}>
            <div className={styles.statSub}>
              <span>최근 30일</span>
              <span className={styles.statSubVal}>{avg30}</span>
            </div>
            <div className={styles.statSub}>
              <span>최근 7일</span>
              <span className={styles.statSubVal}>{avg7}</span>
            </div>
          </div>
        </div>

        <div className={styles.statDivider} />

        {/* 리뷰수 */}
        <div className={styles.statBox}>
          <p className={styles.statLabel}>리뷰수</p>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className={styles.statBig}>{total}</div>
          <div className={styles.statSubList}>
            <div className={styles.statSub}>
              <span>최근 30일 리뷰수</span>
              <span className={styles.statSubVal}>{reviewRationg.COUNT_30 || 0}</span>
            </div>
            <div className={styles.statSub}>
              <span>최근 7일 리뷰수</span>
              <span className={styles.statSubVal}>{reviewRationg.COUNT_7 || 0}</span>
            </div>
          </div>
        </div>

        <div className={styles.statDivider} />

        {/* 별점 분포 */}
        <div className={styles.distBox}>
          {ratingDist.map(({ star, count, pct }) => (
            <div
              key={star}
              className={`${styles.distRow} ${filterRating === star ? styles.distRowActive : ''}`}
              onClick={() => setFilterRating(filterRating === star ? null : star)}
            >
              <span className={styles.distStar}>{star}점</span>
              <div className={styles.distBarWrap}>
                <div
                  className={styles.distBarFill}
                  style={{ width: `${pct}%`, background: star === 5 ? '#FF6B35' : '#ddd' }}
                />
              </div>
              <span className={styles.distCount}>{count}</span>
              <span className={styles.distPct}>({pct}%)</span>
            </div>
          ))}
        </div>

      </div>

      {/* 필터 알림 */}
      {filterRating && (
        <div className={styles.filterNotice}>
          <span>선택하신 <strong>{filterRating}점</strong> 리뷰입니다.</span>
          <button className={styles.filterClear} onClick={() => setFilterRating(null)}>✕ 전체보기</button>
        </div>
      )}

      <div className={styles.reviews}>
        {filteredReviews.map((r, i) => (
          <div key={i} className={styles.block} onClick={async () => {
              setSelctedReview(r);
              setProductRating(null);
              const res = await getProductRating(r.productId);
              setProductRating(res.data);
            }}
          >

            {/* 이미지 영역 */}
            {r.imageUrl ? (
              <div className={styles.overlapPoint}>
                <img src={r.imageUrl} className={styles.reviewImg} />
                <div className={styles.overlap}>포토리뷰</div>
              </div>
            ) : (
              <div className={styles.overlapPoint}>
                <img src={r.imageSavedName} className={styles.reviewImg} />
              </div>
            )}

            {/* 리뷰 내용 */}
            <div className={styles.reviewsContent}>

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
                onClick={e => { e.stopPropagation(); nav(`/products/${r.productId}`); }}
              >
                {r.productName} →
              </span>

            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <Modal
          isOpen={true}
          onClose={() => setSelctedReview(false)}
          width="800px"
        >
          <div className={styles.modalContainer}>
            <img
              src={selectedReview.imageUrl || selectedReview.imageSavedName}
              className={styles.modalImg}
            />
            <div className={styles.modalInfo}>
              <span className={styles.modalProductName}>{selectedReview.productName}</span>
              <div className={styles.modalMeta}>
                <StarDisplay rating={selectedReview.rating} />
                <span className={styles.memberName}>{selectedReview.memberName}</span>
                <span className={styles.createdAt}>{selectedReview.createdAt?.slice(0, 10)}</span>
              </div>
              {productRating && (
                <div className={styles.productRatingBox}>
                  <span className={styles.productRatingLabel}>상품 평균 별점</span>
                  <div className={styles.productRatingRow}>
                    <StarDisplay rating={parseFloat(productRating.avgRating) || 0} />
                    <span className={styles.productRatingCount}>({productRating.totalCount}개 리뷰)</span>
                  </div>
                </div>
              )}
              <p className={styles.modalContent}>{selectedReview.content}</p>
              <span
                className={styles.productNameClick}
                onClick={() => nav(`/products/${selectedReview.productId}`)}
              >
                상품 보러가기 →
              </span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default UserReview
