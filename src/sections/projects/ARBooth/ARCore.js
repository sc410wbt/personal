import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../../Environment"

import s from './ARCore.module.sass'

export default function ARCoreSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()
	const [sectionRef, sectionInView] = useInView()
	const {windowDimensions} = useSelector(state => state.system)

	useEffect(() => {
		if (sectionInView) {
			setCameraPosition(0,3, 15, 0, 2, 0)
			dispatch({ type: 'SET_SCENE_POSITION', position: windowDimensions.width < 760 ? 'center' : 'right' })
			dispatch({ type: 'SET_OBJECT', object: 'android' })
		}
	}, [sectionInView])

	return (
		<section ref={sectionRef}>
			<div className={s.wrapper} ref={ref} />
			<div className={cx(s.panel, { [s.active]: inView })}>
				<h2>Augmented Reality with ARCore</h2>
				<div>The most powerful augmented reality SDKs are baked into mobile operating systems taking most of the pain out of development</div>
			</div>
		</section>
	)

}

