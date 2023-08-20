import React from 'react'
import { GiGlassCelebration } from 'react-icons/gi'
import styles from './loginPage.module.scss'
import { signIn } from 'next-auth/react'
import { Button } from 'antd'

export const LoginPage = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>
        celebrate.DONE
        <div className={styles.logoIcon}>
          <GiGlassCelebration />
        </div>
      </h1>
      <div style={{ margin: '-1em 0 0' }}>
        <Button size={'large'} type={'primary'} onClick={() => signIn()}>
          Sign in
        </Button>
      </div>
    </div>
  )
}

export default LoginPage
