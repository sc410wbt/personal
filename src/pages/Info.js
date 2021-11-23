import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import s from './Info.module.sass'

export default function InfoPage() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		dispatch({ type: 'SET_OBJECT', object: inView ? 'globe' : 'none' })
	}, [inView])

	return (
		<div ref={ref} className={s.wrapper}>
			<h1>WORK by Sun Chen is a non-comprehensive (for now) showcase of some of my projects involving interdisciplinary participation</h1>
			<p>The site is in preview mode and will be adding new content weekly</p>
			<p>For inquiries, please send an email to <strong>sunnnchen@gmail.com</strong></p>
		</div>
	)
}
