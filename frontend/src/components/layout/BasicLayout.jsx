/// 메인 화면 레이아웃 ///

import React from 'react'
import styles from './BasicLayout.module.css'
import BasicHeader from './BasicHeader'
import { Outlet } from 'react-router-dom'
import BasicFooter from './BasicFooter'

const BasicLayout = () => {
  return (
    <>
      <div className={styles.container}>
        <BasicHeader/>
        <div>
          <Outlet/>
        </div>
      </div>
        <BasicFooter/>
    </>
  )
}

export default BasicLayout