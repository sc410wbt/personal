import React, {useEffect} from 'react'
import {useLocation, useHistory} from "react-router"
import cx from 'classnames'


import s from './Header.module.sass'

export default function Header() {

	const history = useHistory()
	const location = useLocation()

	function handleClick() {
		history.push('/')
	}

	return (
		<div className={s.wrapper}>
			<header>
				<strong>WORK</strong> by Sun Chen
				<div className={cx(s.close, { [s.active]: location.pathname !== '/' })} onClick={handleClick}>
					<span />
					<span />
				</div>
			</header>
		</div>
	)
}
