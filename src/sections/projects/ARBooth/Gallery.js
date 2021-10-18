import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import {setCameraPosition} from "../../../Environment"
import GalleryImage from "../../templates/GalleryImage"

import image from '../../../media/projects/ARBooth/device-close-up.jpg'

import s from './Gallery.module.sass'

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
			<div className={s.wrapper}>
				<div ref={ref}>
					<GalleryImage src={image} />
					<GalleryImage src={image} />
				</div>
			</div>
		</section>
	)

}
