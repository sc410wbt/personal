import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import {setCameraPosition} from "../../../Environment"

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
					<div className={s.image}>
						<img src={image} />
						<div className={s.text}>
							Use the app on a device mounted to a mechanized track to take an Augmented Reality video
						</div>
					</div>
				</div>
			</div>
		</section>
	)

}
