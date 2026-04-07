import { useState } from "react"
import { getRecipe } from "../../api/aiApi"
import { insertCartItem } from "../../api/product/product"
import styles from "./AiChef.module.css"

const AiChef = () => {
  const [servings, setServings] = useState(2)
  const [menu, setMenu] = useState('')
  const [recipe, setRecipe] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // 1. 빈 값 체크 및 이미 로딩 중인지 확인 (중복 클릭 방지)
    if (!menu.trim()) { alert('메뉴를 입력해주세요.'); return }
    setLoading(true)
    setRecipe('')
    setProducts([])
    try {
      const data = await getRecipe(servings, menu)
      setRecipe(data.recipe)
      setProducts(data.products)
    } catch (e) {
      alert('레시피 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCart = async (productId) => {
    try {
      await insertCartItem({ productId, cartItemQty: 1 })
      alert('장바구니에 담았습니다.')
    } catch (e) {
      alert('장바구니 담기 실패')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🍳 AI 셰프</h2>
      <p className={styles.subtitle}>메뉴를 입력하면 레시피와 필요한 재료를 추천해드려요</p>

      <div className={styles.form}>
        <div className={styles.formRow}>
          <label>인원</label>
          <select value={servings} onChange={e => setServings(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n}인분</option>
            ))}
          </select>
        </div>
        <div className={styles.formRow}>
          <label>메뉴</label>
          <input
            type="text"
            placeholder="예) 김치찌개, 불고기, 된장찌개"
            value={menu}
            onChange={e => setMenu(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '레시피 생성 중...' : '레시피 생성'}
        </button>
      </div>

      {recipe && (
        <div className={styles.recipeBox}>
          <h3>📋 레시피</h3>
          <p>{recipe}</p>
        </div>
      )}

      {products.length > 0 && (
        <div className={styles.productSection}>
          <h3>🛒 추천 상품</h3>
          <div className={styles.productGrid}>
            {products.map((product, idx) => (
              <div key={idx} className={styles.productCard}>
                {product.mainImage && (
                  <img src={product.mainImage} alt={product.productName} />
                )}
                <p className={styles.productName}>{product.productName}</p>
                <p className={styles.productPrice}>{product.productPrice.toLocaleString()}원</p>
                <button onClick={() => handleAddCart(product.productId)}>
                  장바구니 담기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AiChef