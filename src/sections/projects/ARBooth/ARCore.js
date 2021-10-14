import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useInView} from "react-intersection-observer"

import {setCameraPosition} from "../../../Environment"


import s from './ARCore.module.sass'

import image from '../../../media/projects/ARBooth/android-models.jpg'

export default function ARCoreSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0,7, 10)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'right' })
			dispatch({ type: 'SET_OBJECT', object: 'android' })
		}
	}, [inView])

	return (
		<div className={s.wrapper}>
			<div className={s.image}>
				<div>3D Objects</div>
				<img src={image} ref={ref} />
			</div>
		</div>
	)

}

