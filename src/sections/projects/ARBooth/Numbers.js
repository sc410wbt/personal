import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../../Environment"

import s from './Numbers.module.sass'

export default function NumbersSection() {

	const [ref, inView] = useInView()
	const dispatch = useDispatch()

	useEffect(() => {
		if (inView) {
			setCameraPosition(0, 15, 20, 0, 0, 1)
			dispatch({ type: 'SET_OBJECT', object: 'cube' })
			dispatch({ type: 'SET_SCENE_POSITION', object: 'center' })
		} else {

		}
	}, [inView])

	return (
		<section>
			<div className={s.wrapper} ref={ref}>
				<div className={cx(s.panel, { [s.active]: inView })}>

				</div>
			</div>
		</section>
	)
}
