import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../../Environment"

import technicalDrawing from '../../../media/projects/ARBooth/technical-drawing.jpg'

import s from './Stage.module.sass'

import image from '../../../media/projects/ARBooth/android-models.jpg'

export default function StageSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			// setCameraTarget(10, 0, -10)
			setCameraPosition(0,4, 15, 0, 2, 0)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'right' })
			dispatch({ type: 'SET_OBJECT', object: 'camera' })
		}
	}, [inView])

	return (
		<section>
			<div className={s.wrapper} ref={ref} />
			<div className={cx(s.panel, { [s.active]: inView })}>
				<h2>Get everything measured</h2>
				<div>We had to test everything out to make sure it worked</div>
				<img src={technicalDrawing} />
			</div>
		</section>
	)

}

