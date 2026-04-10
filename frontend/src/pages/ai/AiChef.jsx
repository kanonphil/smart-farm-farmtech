import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AiChef.module.css'
import { requestAiChefRecommendation } from '../../api/aiChefApi'
import { insertCartItem } from '../../api/product/product'
import useAuthStore from '../../store/authStore'

// ─────────────────────────────────────────────────────────────────
// 선택 옵션 상수
// ─────────────────────────────────────────────────────────────────

/** 식사 상황 선택 옵션 */
const SITUATION_OPTIONS = [
  { label: '가족/친척들', value: '가족이나 친척들과 함께하는 자리' },
  { label: '혼밥', value: '혼자 먹는 식사' },
  { label: '부모님께', value: '연세 많으신 부모님과 함께하는 자리' },
  { label: '어린아이와', value: '어린아이도 함께 먹는 자리' },
  { label: '선물용', value: '선물로 드리기 위한 구매' },
]

/** 스타일/맛 선택 옵션 */
const STYLE_OPTIONS = [
  { label: '무난한/실패없는', value: '무난하고 실패 없는 요리' },
  { label: '최고의 맛', value: '가격 무관 최고의 맛' },
  { label: '가성비', value: '가성비 좋고 저렴한 요리' },
  { label: '부드러운 식감', value: '부드러운 식감 중심' },
  { label: '육즙 팡팡', value: '육즙이 풍부한 요리' },
  { label: '스테이크', value: '스테이크 요리' },
  { label: '숯불/캠핑', value: '숯불구이 또는 캠핑 요리' },
  { label: '희소부위(특수)', value: '특수 희소 부위를 활용한 요리' },
]

// ─────────────────────────────────────────────────────────────────
// AiChef 컴포넌트
// ─────────────────────────────────────────────────────────────────

/**
 * AI 셰프 페이지 컴포넌트
 *
 * 사용자가 상황/스타일을 선택하면 Gemini API를 통해
 * 소고기 레시피를 추천하고 관련 상품을 노출한다.
 * 장바구니 담기는 로그인한 사용자만 가능하다.
 */
const AiChef = () => {
  const navigate = useNavigate()
  const { showAlert } = useAuthStore()

  /** 선택된 식사 상황 */
  const [situation, setSituation] = useState(null)
  /** 선택된 스타일/맛 */
  const [style, setStyle] = useState(null)
  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false)
  /** AI 추천 결과 (recipe + matchedProducts) */
  const [result, setResult] = useState(null)
  /** 에러 메시지 */
  const [error, setError] = useState(null)
  /** 장바구니 추가 상태 메시지 (productId → 메시지) */
  const [cartStatus, setCartStatus] = useState({})
  /** 이전 추천 레시피명 목록 (다른 추천 보기용) */
  const [previousRecipes, setPreviousRecipes] = useState([])
  /** 자유 검색어 */
  const [freeText, setFreeText] = useState('')
  /** 마지막으로 검색한 자유 검색어 (다른 추천 보기용) */
  const [lastFreeText, setLastFreeText] = useState('')
  /** 로그인 확인 */
  const { token } = useAuthStore()

  /** 로그인 후 복귀 시 저장된 결과 복원 */
  useEffect(() => {
    const saved = sessionStorage.getItem('aiChefSavedResult')
    if (saved) {
      setResult(JSON.parse(saved))
      sessionStorage.removeItem('aiChefSavedResult')
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────
  // 추천 요청
  // ─────────────────────────────────────────────────────────────────

  /**
   * AI 셰프 추천을 요청한다.
   * 상황과 스타일을 모두 선택해야 요청 가능하다.
   */
  const handleRecommend = async () => {
    if (!situation) { showAlert('식사 상황을 선택해주세요.'); return }
    if (!style) { showAlert('원하는 스타일을 선택해주세요.'); return }

    setIsLoading(true)
    setError(null)

    try {
      const data = await requestAiChefRecommendation({
        situation,
        style,
        previousRecipes,
      })

      setResult(data)

      // 이전 추천 목록에 현재 추천 레시피 추가 (다른 추천 보기 시 중복 방지)
      if (data.recipe?.recipeName) {
        setPreviousRecipes(prev => [...prev, data.recipe.recipeName])
      }
    } catch (e) {
      setError('추천 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 랜덤 추천 요청
   * 상황과 스타일을 무작위로 선택하여 바로 추천을 요청한다.
   */
  const handleRandom = async () => {
    const randomSituation = SITUATION_OPTIONS[Math.floor(Math.random() * SITUATION_OPTIONS.length)]
    const randomStyle = STYLE_OPTIONS[Math.floor(Math.random() * STYLE_OPTIONS.length)]

    setSituation(randomSituation.value)
    setStyle(randomStyle.value)
    setIsLoading(true)
    setError(null)

    try {
      const data = await requestAiChefRecommendation({
        situation: randomSituation.value,
        style: randomStyle.value,
        previousRecipes,
      })
      setResult(data)
      if (data.recipe?.recipeName) {
        setPreviousRecipes(prev => [...prev, data.recipe.recipeName])
      }
    } catch (e) {
      setError('추천 서비스에 일시적인 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 다른 추천 보기
   * 현재 선택된 조건으로 다시 요청하되 이전 추천 목록을 함께 전달한다.
   */
  const handleAnotherRecommend = async () => {
    if (lastFreeText) {
      handleFreeSearchWith(lastFreeText)
    } else {
      handleRecommend()
    }
}

  /**
   * 자유 검색어로 레시피 추천 요청
   */
  const handleFreeSearch = async () => {
    if (!freeText.trim()) { showAlert('검색어를 입력해주세요.'); return }
    const searchText = freeText.trim()
    setFreeText('')
    handleFreeSearchWith(searchText)
  }

  /**
 * 자유 검색어를 파라미터로 받아 추천 요청
 * handleFreeSearch와 handleAnotherRecommend 에서 공용으로 사용
 *
 * @param {string} text - 검색어
 */
  const handleFreeSearchWith = async (text) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await requestAiChefRecommendation({
        freeText: text,
        previousRecipes,
      })
      setResult(data)
      setLastFreeText(text)
      if (data.recipe?.recipeName) {
        setPreviousRecipes(prev => [...prev, data.recipe.recipeName])
      }
    } catch (e) {
      setError('추천 서비스에 일시적인 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 장바구니 담기
  // ─────────────────────────────────────────────────────────────────

  /**
   * 장바구니 담기 처리
   * 비로그인 상태이면 로그인 페이지로 유도한다.
   *
   * @param {number} productId - 담을 상품 ID
   */
  const handleAddToCart = async (productId) => {
    // 로그인 여부 확인
    
    if (!token) {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동할까요?')) {
        sessionStorage.setItem('aiChefSavedResult', JSON.stringify(result))
        navigate('/login', {state: {from: '/ai-chef'}})
      }
      return
    }

    try {
      await insertCartItem({ productId, cartItemQty: 1 })
      // 성공 상태 메시지 표시
      setCartStatus(prev => ({ ...prev, [productId]: '장바구니에 담겼습니다! ✓' }))
      setTimeout(() => {
        setCartStatus(prev => ({ ...prev, [productId]: null }))
      }, 2000)
    } catch (e) {
      setCartStatus(prev => ({ ...prev, [productId]: '담기 실패. 다시 시도해주세요.' }))
      setTimeout(() => {
        setCartStatus(prev => ({ ...prev, [productId]: null }))
      }, 2000)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* ── 좌측 패널: 조건 선택 ── */}
      <div className={styles.leftPanel}>
        <div className={styles.titleWrap}>
          <span className={styles.badge}>AI Chef</span>
          <h1 className={styles.title}>오늘 뭐 먹지?</h1>
          <p className={styles.subtitle}>상황과 취향을 선택하면 AI가 한우 레시피를 추천해드립니다.</p>
        </div>

        {/* 자유 검색창 */}
        <div className={styles.searchWrap}>
          <input
            type='text'
            className={styles.searchInput}
            placeholder='예: 불고기, 살치살 스테이크, 갈비찜...'
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFreeSearch()}
          />
          <button
            className={styles.searchBtn}
            onClick={handleFreeSearch}
            disabled={isLoading}
          >
            검색
          </button>
        </div>

        <div className={styles.divider}>또는 조건으로 찾기</div>

        {/* 상황 선택 */}
        <div className={styles.sectionLabel}>누구와 함께 하나요?</div>
        <div className={styles.optionGroup}>
          {SITUATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.optionBtn} ${situation === opt.value ? styles.selected : ''}`}
              onClick={() => setSituation(prev => prev === opt.value ? null : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 스타일 선택 */}
        <div className={styles.sectionLabel}>원하는 스타일은?</div>
        <div className={styles.optionGroup}>
          {STYLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.optionBtn} ${style === opt.value ? styles.selected : ''}`}
              onClick={() => setStyle(prev => prev === opt.value ? null : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className={styles.actionBtns}>
          <button
            className={styles.recommendBtn}
            onClick={handleRecommend}
            disabled={isLoading}
          >
            {isLoading ? '추천 중...' : '🍖 추천 받기'}
          </button>
          <button
            className={styles.randomBtn}
            onClick={handleRandom}
            disabled={isLoading}
          >
            🎲 랜덤 추천
          </button>
        </div>
      </div>

      {/* ── 우측 패널: 결과 카드 ── */}
      <div className={styles.rightPanel}>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>AI 셰프가 최적의 한우 레시피를 찾고 있습니다...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className={styles.errorWrap}>
            <p>{error}</p>
          </div>
        )}

        {/* 초기 상태 (결과 없음) */}
        {!result && !isLoading && !error && (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}>🥩</div>
            <p>왼쪽에서 상황과 스타일을 선택하고</p>
            <p>추천 받기를 눌러보세요.</p>
          </div>
        )}

        {/* 추천 결과 */}
        {result && !isLoading && (
          <div className={styles.resultCard}>

            {/* fallback 안내 */}
            {result.fallback && (
              <div className={styles.fallbackBanner}>
                {result.fallbackMessage}
              </div>
            )}

            {/* 레시피 헤더 */}
            <div className={styles.recipeHeader}>
              <span className={styles.aiPickBadge}>AI Chef's Pick</span>
              <h2 className={styles.recipeName}>{result.recipe?.recipeName}</h2>
              <p className={styles.recipeSummary}>{result.recipe?.summary}</p>
            </div>

            {/* 기본 정보 태그 */}
            {result.recipe?.recipeDescription && (
              <div className={styles.tagRow}>
                <span className={styles.tag}>🔥 난이도 {result.recipe.recipeDescription.difficulty}</span>
                <span className={styles.tag}>🍳 {result.recipe.recipeDescription.cookingMethod}</span>
                <span className={styles.tag}>⏱ {result.recipe.recipeDescription.estimatedTimeMinutes}분</span>
                <span className={styles.tag}>🌙 {result.recipe.recipeDescription.mood}</span>
              </div>
            )}

            {/* 선정 이유 */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                {result.recipe?.recommendedReasonTitle || '선정 이유'}
              </div>
              <p className={styles.sectionBody}>{result.recipe?.recommendedReasonBody}</p>
            </div>

            {/* 재료 */}
            {result.recipe?.ingredients?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>재료</div>
                <div className={styles.ingredientGrid}>
                  {result.recipe.ingredients.map((ing, i) => (
                    <span key={i} className={styles.ingredientItem}>
                      {ing.name} <span className={styles.amount}>{ing.amount}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 조리 순서 */}
            {result.recipe?.steps?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>조리 순서</div>
                <ol className={styles.stepList}>
                  {result.recipe.steps.map((step, i) => (
                    <li key={i} className={styles.stepItem}>
                      {/* <span className={styles.stepNumber}>{i + 1}</span> */}
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 서빙 팁 */}
            {result.recipe?.servingTips?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>💡 셰프 팁</div>
                <ul className={styles.tipList}>
                  {result.recipe.servingTips.map((tip, i) => (
                    <li key={i} className={styles.tipItem}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 매칭 상품 */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🛒 추천 상품</div>

              {/* 상품 매칭 실패 안내 */}
              {result.productMatchMessage && (
                <p className={styles.noProduct}>{result.productMatchMessage}</p>
              )}

              {/* 상품 카드 목록 */}
              <div className={styles.productList}>
                {result.matchedProducts?.map(product => (
                  <div key={product.productId} className={styles.productCard}>
                    {/* 상품 이미지 */}
                    {product.mainImage && (
                      <img
                        src={product.mainImage}
                        alt={product.productName}
                        className={styles.productImg}
                      />
                    )}
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.productName}</p>
                      <p className={styles.productPrice}>
                        {product.productPrice?.toLocaleString()}원
                      </p>
                      <p className={styles.matchReason}>{product.matchReason}</p>

                      {/* 장바구니 상태 메시지 */}
                      {cartStatus[product.productId] && (
                        <p className={styles.cartMsg}>{cartStatus[product.productId]}</p>
                      )}

                      {/* CTA 버튼 */}
                      <div className={styles.productBtns}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/products/${product.productId}`)}
                        >
                          상품 보러가기
                        </button>
                        <button
                          className={styles.cartBtn}
                          onClick={() => handleAddToCart(product.productId)}
                        >
                          장바구니 담기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 다른 추천 보기 */}
            <button
              className={styles.anotherBtn}
              onClick={handleAnotherRecommend}
              disabled={isLoading}
            >
              🔄 다른 추천 보기
            </button>

          </div>
        )}
      </div>
    </div>
  )
}

export default AiChef
