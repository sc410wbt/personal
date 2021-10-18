import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../../Environment"

import technicalDrawing from '../../../media/projects/ARBooth/technical-drawing.jpg'

import s from './Stage.module.sass'

import image from '../../../media/projects/ARBooth/android-models.jpg'

export default function StageSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()
	const [sectionRef, sectionInView] = useInView()
	const {windowDimensions} = useSelector(state => state.system)


	useEffect(() => {
		if (sectionInView) {
			// setCameraTarget(10, 0, -10)
			setCameraPosition(0,4, 15, 0, 2, 0)
			dispatch({ type: 'SET_SCENE_POSITION', position: windowDimensions.width < 760 ? 'center' : 'right' })
			dispatch({ type: 'SET_OBJECT', object: 'phone' })
		}
	}, [sectionInView])

	return (
		<section ref={sectionRef}>
			<div className={s.wrapper} ref={ref} />
			<div className={cx(s.panel, { [s.active]: inView })}>
				<h2>Get everything measured</h2>
				<div>We had to test everything out to make sure it worked</div>
				<img src={technicalDrawing} />
			</div>
		</section>
	)

}

