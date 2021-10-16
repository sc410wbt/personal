import React, {useEffect, useState} from 'react'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import s from './Goal.module.sass'

export default function Goal({ goal, no }) {

	const [margin, setMargin] = useState(0)
	const [ref, inView] = useInView()

	useEffect(() => {
		setMargin(Math.random() * 70)
	}, [])

	useEffect(() => {

	}, [inView])

	return (
		<div className={cx(s.goal, { [s.active]: inView })} style={{ marginLeft: `${margin}%` }} ref={ref}>
			<div className={s.number}>{no + 1}</div>
			{goal}
		</div>
	)
}
