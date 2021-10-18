import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import {useDispatch} from "react-redux"

import {setCameraPosition} from "../../../Environment"
import GalleryImage from "../../templates/GalleryImage"

import appImage from '../../../media/projects/ARBooth/device-close-up.jpg'
import droidImage from '../../../media/projects/ARBooth/droid-mascot.jpg'

import s from './Gallery.module.sass'

export default function GallerySection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0, 3,4.5, 0, 3, 0)
			// setCameraPosition(5, 3,5, 5, 0, 5)
			dispatch({ type: 'SET_OBJECT', object: 'globe' })
			dispatch({ type: 'SET_SCENE_POSITION', object: 'center' })
		}
	}, [inView])

	return (
		<section>
			<div className={s.wrapper}>
				<div ref={ref}>
					<GalleryImage src={appImage} />
					<GalleryImage src={droidImage} />
				</div>
			</div>
		</section>
	)

}
