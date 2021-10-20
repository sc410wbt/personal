import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {useInView} from "react-intersection-observer"
import {setCameraPosition} from "../../Environment"
import cx from "classnames"

import s from './SidePanel.module.sass'

export default function SidePanelTemplate({ title, theme, cover, content, object, cameraPosition }) {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()
	const [sectionRef, sectionInView] = useInView()
	const {windowDimensions} = useSelector(state => state.system)

	useEffect(() => {
		if (sectionInView) {
			setCameraPosition(0,3, 15, 0, 2, 0)
			dispatch({ type: 'SET_SCENE_POSITION', position: windowDimensions.width < 760 ? 'center' : 'right' })
			dispatch({ type: 'SET_OBJECT', object: object || 'android' })
		}
	}, [sectionInView])

	return (
		<section ref={sectionRef}>
			<div className={s.wrapper} ref={ref} />
			<div className={cx(s.panel, { [s.active]: inView })}>
				<Cover src={cover} />
				<h2>{title}</h2>
				<div className={s.content}>{content}</div>
			</div>
		</section>
	)

}

function Cover({ src }) {
	if (!src) return null
	return (
		<div className={s.cover}>
			<img src={src} />
		</div>
	)
}
