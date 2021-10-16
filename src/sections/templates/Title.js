import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../Environment"

import s from './Title.module.sass'

export default function TitleTemplate({ title, tags }) {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0, 15, 20, 0, 0, 3)
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
			dispatch({ type: 'SET_OBJECT', object: 'camera' })
			dispatch({ type: 'SET_TITLE', title: title })
		} else {

		}
	}, [inView])

	let processedTitle = []
	for (let x = 0; x < title.length; x++) {
		let char = title.charAt(x)
		if (char === ' ') processedTitle.push(<div>{}</div>)
		else processedTitle.push(<span>{char}</span>)
	}

	return (
		<div className={s.wrapper}>
			<div style={{ position: 'absolute', top: '50px' }} ref={ref} />
			<div className={cx(s.more, { [s.active]: inView })}>
				scroll down
			</div>
			{/*<div className={s.bg} />*/}
			<h1 className={cx({ [s.active]: inView })}>
				{/*{processedTitle}*/}
			</h1>
		</div>
	)

}
