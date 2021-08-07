import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import cx from 'classnames'

import pageData from '../library/pages.json'

import s from './Nav.module.sass'


function Nav(props) {

	const dispatch = useDispatch()
	const page = useSelector(state => state.page)
	console.log(page)

	let nav = pageData.map(item => {
		return (
			<Link to={item.href} className={cx({ [s.active]: item.href === page })}>{item.title}</Link>
		)
	})

	return (
		<div className={s.wrapper}>
			{nav}
		</div>
	)

}

export default withRouter(Nav)
