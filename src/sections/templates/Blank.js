import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {useInView} from "react-intersection-observer"
import {setCameraPosition} from "../../Environment"
import cx from "classnames"

import s from './Blank.module.sass'

export default function BlankTemplate({ title, subtitle, content, object, cameraPosition }) {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()
	const {windowDimensions} = useSelector(state => state.system)

	useEffect(() => {
		if (inView) {
			setCameraPosition(0,10, 15, 0, 10, 0)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
			dispatch({ type: 'SET_OBJECT', object: 'none' })
		}
	}, [inView])

	return (
		<section>
			<div className={s.wrapper} ref={ref} />
			<div className={cx(s.panel, { [s.active]: inView })}>
				<h2>{title}</h2>
				{subtitle ? <div>{subtitle}</div> : null}
				<div>The most powerful augmented reality SDKs are baked into mobile operating systems taking most of the pain out of development</div>
			</div>
		</section>
	)

}
