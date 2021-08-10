import React, {useEffect} from 'react'
import {TransitionGroup, CSSTransition} from "react-transition-group"
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

	let titles = pageData.map(item => {
		if (item.href === page) {
			return (
				<CSSTransition key={item.href} timeout={5000} className={s.container}>
					<div>
						<div className={s.title} dangerouslySetInnerHTML={{__html: item.title}}/>
						<div className={s.client}>// {item.subtitle}</div>
					</div>
				</CSSTransition>
			)
		}
	})

	return (
		<div className={s.wrapper}>
			<TransitionGroup>
				{titles}
			</TransitionGroup>
		</div>
	)

}

export default withRouter(PageTitle)
