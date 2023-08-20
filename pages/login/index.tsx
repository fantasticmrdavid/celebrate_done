import React from 'react'
import { GiGlassCelebration } from 'react-icons/gi'
import styles from './loginPage.module.scss'
import { signIn } from 'next-auth/react'
import { Button } from 'antd'

export const LoginPage = () => {
  return (
    <h2 style={{ textAlign: 'center' }}>
      celebrate.DONE
      <div className={styles.logoIcon}>
        <GiGlassCelebration />
      </div>
      <div>
        <Button type={'primary'} onClick={() => signIn()}>
          Sign in
        </Button>
      </div>
    </h2>
  )
}

export default LoginPage
