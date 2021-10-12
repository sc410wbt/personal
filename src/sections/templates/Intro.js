import React, {useEffect} from 'react'
import cx from 'classnames'
import {useInView} from "react-intersection-observer"

import s from './Intro.module.sass'

export default function IntroTemplate({ text }) {

	const {ref, inView} = useInView()

	useEffect(() => {
		if (inView) {

		}
	}, [inView])

	return (
		<div className={s.wrapper}>
			<div className={cx([s.panel, { [s.active]: inView }])} ref={ref}>
				{text}
			</div>
		</div>
	)

}
