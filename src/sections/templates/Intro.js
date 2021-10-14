import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import cx from 'classnames'
import {useInView} from "react-intersection-observer"

import {setCameraPosition, showObject} from "../../Environment"
import {hideObject} from "../../Environment"

import s from './Intro.module.sass'

export default function IntroTemplate({ text }) {

	const dispatch = useDispatch()
	const {ref, inView} = useInView()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0,15, 0)
			dispatch({ type: 'SET_OBJECT', object: 'none' })
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
			// dispatch({ type: 'SET_CAMERA_POSITION', position: { y: 5, z: 5 } })
		} else {
			showObject()
			// dispatch({ type: 'SET_CAMERA_POSITION', position: { y: 20, z: 20 } })
		}
	}, [inView])

	return (
		<div className={s.wrapper}>
			<div className={cx(s.title, { [s.active]: inView })}>
				The Brief
			</div>
			<div className={cx([s.panel, { [s.active]: inView }])} ref={ref}>
				{text}
			</div>
		</div>
	)

}
