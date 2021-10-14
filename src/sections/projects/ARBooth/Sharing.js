import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {useInView} from "react-intersection-observer"

export default function SharingSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			dispatch({ type: 'SET_OBJECT', object: 'rhino' })
		}
	}, [inView])

	return (
		<div>
			<div ref={ref}>About sharing</div>
		</div>
	)

}
