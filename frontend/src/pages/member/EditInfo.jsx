import React from 'react'
import Form from '../../components/common/Form'
import styles from './EditInfo.module.css'
import Input from '../../components/common/Input'

const EditInfo = () => {
  return (
    <div className={styles.container} data-theme='light'>
      <Form>
        <Input
          label='이메일'
          readOnly
        />
        <Input
          label='이름'
          button='수정'
        />
        <Input
          label='전화번호'
          button='수정'
        />
        <Input
          label='주소'
          button='수정'
        />
      </Form>
    </div>
  )
}

export default EditInfo
