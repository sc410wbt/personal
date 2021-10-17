import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import {setCameraPosition} from "../../../Environment"

import image from '../../../media/projects/ARBooth/device-close-up.jpg'

export default function GallerySection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0, 3,4, 0, 3, 0)
			dispatch({ type: 'SET_OBJECT', object: 'globe' })
			dispatch({ type: 'SET_SCENE_POSITION', object: 'center' })
		}
	}, [inView])

	return (
		<section>
			<div ref={ref} />
			<div>
				<img src={image} style={{ width: '100%', border: 'solid 5px black' }} />
			</div>
		</section>
	)

}
