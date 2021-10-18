import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {useInView} from "react-intersection-observer"

import {setCameraPosition} from "../../../Environment"

export default function NumbersSection() {

	const [ref, inView] = useInView()
	const dispatch = useDispatch()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0, 15, 20)
			dispatch({ type: 'SET_OBJECT', object: 'cube' })
		} else {

		}
	}, [inView])

	return (
		<section>
			<div ref={ref} />
			...
		</section>
	)
}
