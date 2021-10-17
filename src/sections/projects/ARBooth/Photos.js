import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {useInView} from "react-intersection-observer"

import {addPhotos, setCameraPosition} from "../../../Environment"

export default function PhotosSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		addPhotos()
	}, [])

	useEffect(() => {
		if (inView) {
			setCameraPosition(-17, 5, -5, -20, 3, -20)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
		}
	}, [inView])

	return (
		<section ref={ref}>
			...
		</section>
	)

}
