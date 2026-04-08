import React, { useEffect, useState } from 'react'
import styles from './UserReview.module.css'
import { getReviews } from '../../api/reviewApi'

const UserReview = () => {
  const [reviews,setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  },[])

  const fetchReviews = async() => {
    const response = await getReviews();
    setReviews(response.data)
  }
  console.log(reviews);
  return (
    <div className={styles.container}>
      <div className={styles.headerName}>
        <h3>상품리뷰</h3>
      </div>
      
      <div className={styles.selector}>

      </div>

      <div className={styles.review_summary}>

      </div>

      <div className={styles.reviews}>
        <div>
          
        </div>
      </div>
    </div>
  )
}

export default UserReview