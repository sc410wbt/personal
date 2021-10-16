import React, {useEffect} from 'react'
import {useLocation} from "react-router"
import cx from 'classnames'


import s from './Header.module.sass'

export default function Header() {

	const location = useLocation()

	return (
		<div className={s.wrapper}>
			<header>
				<strong>WORK</strong> by Sun Chen
				<div className={cx(s.close, { [s.active]: location.pathname !== '/' })}>
					<span />
					<span />
				</div>
			</header>
		</div>
	)
}
