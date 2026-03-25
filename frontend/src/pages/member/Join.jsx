import React from 'react'
import styles from './Join.module.css'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

const Join = () => {
  return (
    <div className={styles.container}>
      <div>
        <p>이름 </p>
        <div>
        <Input/>
        <Button>
          중복확인
        </Button>
        </div>
      </div>
      <div>
        <p>비밀번호 :</p>
        <Input/>
      </div>
      <div>
        <p>비밀번호 확인 : </p>
        <Input/>
      </div>
      <div>
        <p>전화번호 : </p>
        <div className={styles.tel_div}>
          <Input/>
          <Input/>
          <Input/>
        </div>
      </div>
      <div>
        <p>주소 :</p>
        <div>
          <Input/>
          <Button>
            검색
          </Button>
        </div>
          <Input/>
      </div>
      <div className={styles.signUp_btn}>
        <Button
          onClick={''}
          >
          회원가입
        </Button>
      </div>
    </div>
  )
}

export default Join