import React, {useEffect} from 'react'
import {withRouter} from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"

import pageData from '../library/pages.json'

import s from './PageTitle.module.sass'


function PageTitle(props) {

	const dispatch = useDispatch()
	const page = useSelector(state => state.page)

	useEffect(() => {
		dispatch({ type: 'SET_PAGE', page: props.history.location.pathname })
	}, [props.history.location.pathname])

	let data = pageData.find(obj => obj.href === page)
	console.log(data)

	return (
		<div className={s.wrapper}>
			<div className={s.title} dangerouslySetInnerHTML={{ __html: data.title }} />
			<div className={s.client}>// {data.subtitle}</div>
		</div>
	)

}

export default withRouter(PageTitle)
