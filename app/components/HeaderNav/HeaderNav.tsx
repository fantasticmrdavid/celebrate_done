import React, { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { Dropdown, Menu, MenuProps, Space } from 'antd'
import styles from './headerNav.module.scss'
import Link from 'next/link'
import { UserContext } from '@/app/contexts/User'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { COOKIE_NAME } from '@/app/constants/constants'
import { deleteCookie } from 'cookies-next'

const menuItemList: MenuProps['items'] = [
	{
		label: <Link href={'/'}>To Do</Link>,
		key: 'todo',
	},
	{
		label: <Link href={'/done'}>Done</Link>,
		key: 'done',
	},
	{
		label: <Link href={'/coming-up'}>Coming Up</Link>,
		key: 'coming-up',
	},
]

const menuKeysToRoutes = [
	{
		key: 'todo',
		route: '/',
	},
	{
		key: 'done',
		route: '/done',
	},
	{
		key: 'coming-up',
		route: '/coming-up',
	},
]

export const HeaderNav = () => {
	const [isUserMenuCollapsed, setIsUserMenuCollapsed] = useState<boolean>(true)
	const { user, isFetchingUser } = useContext(UserContext)
	const router = useRouter()
	if (isFetchingUser) return null
	return (
		<Space className={styles.container}>
			<Space className={styles.contentWrapper}>
				<h2 className={styles.title}>celebrate.DONE 🎉</h2>
				<Space>
					<Menu
						className={styles.menu}
						items={menuItemList}
						theme={'dark'}
						selectedKeys={menuKeysToRoutes
							.filter((mk) => router.route === mk.route)
							.map((i) => i.key)}
					/>
					<div className={styles.user}>
						<Dropdown
							trigger={['click']}
							menu={{
								items: [
									{
										label: (
											<div
												onClick={() => {
													deleteCookie(COOKIE_NAME)
													router.push('./')
												}}
											>
												<LogoutOutlined /> Logout {user.username}
											</div>
										),
										key: '1',
									},
								],
							}}
						>
							<UserOutlined
								onClick={() => setIsUserMenuCollapsed(!isUserMenuCollapsed)}
							/>
						</Dropdown>
					</div>
				</Space>
			</Space>
		</Space>
	)
}

export default HeaderNav
