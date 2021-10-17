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
			setCameraPosition(-20, 5, -5, -20, 3, -20)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
			dispatch({ type: 'SET_ROTATION_OBJECT', object: 'photos' })
		} else {
			dispatch({ type: 'SET_ROTATION_OBJECT', object: 'stage' })
		}
	}, [inView])

	return (
		<section>
			<div ref={ref}></div>
			...
		</section>
	)

}
