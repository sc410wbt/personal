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
				<div className={cx(s.panels, { [s.active]: inView })}>
					<div className={s.panel}>
						<div className={s.number}>
							15
							<div className={s.unit}>seconds</div>
						</div>
						to record, upload, compress and generate dynamic webpage to share and download
					</div>
					<div className={s.panel}>
						<div className={s.number}>
							0
							<div className={s.unit}>instances</div>
						</div>
						of downtime over a two-day event with an almost constant queue for two booths
					</div>
					<div className={s.panel}>
						<div className={s.number}>
							3
							<div className={s.unit}>awards</div>
						</div>
						for Best Digital Campaign, Best Brand Experience and Best Corporate Event from Event Marketing Asia Pacific
					</div>
				</div>
			</div>
		</section>
	)
}
