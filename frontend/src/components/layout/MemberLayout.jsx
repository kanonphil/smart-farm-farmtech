import React from 'react'
import BasicHeader from './BasicHeader'
import MemberMenu from './MemberMenu'
import { Outlet } from 'react-router-dom'
import styles from './MemberLayout.module.css'

const MemberLayout = () => {
  return (
    <div className={styles.container}>
      <div className={styles.menu}><MemberMenu/></div>
      <div className={styles.pages}><Outlet/></div>
    </div>
  )
}

export default MemberLayout
