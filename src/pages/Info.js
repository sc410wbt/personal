import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import s from './Info.module.sass'

export default function InfoPage() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			dispatch({ type: 'SET_OBJECT', object: 'globe' })
		} else {
			dispatch({ type: 'SET_OBJECT', object: 'none' })
		}
	}, [inView])

	return (
		<div ref={ref}>
			more information coming soon
		</div>
	)
}
