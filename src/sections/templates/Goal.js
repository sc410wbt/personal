import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux"
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import s from './Goal.module.sass'

export default function Goal({ goal, no }) {

	const [margin, setMargin] = useState(0)
	const [ref, inView] = useInView()
	const {windowDimensions} = useSelector(state => state.system)

	useEffect(() => {
		if (windowDimensions.width < 760) setMargin('20px')
		else {
			let percent = 350 / windowDimensions.width * 100
			setMargin('calc(' + ((Math.random() * (100 - percent)) + percent) + '% - 350px)')
		}
	}, [windowDimensions])

	useEffect(() => {

	}, [inView])

	return (
		<div className={cx(s.goal, { [s.active]: inView })} style={{ marginLeft: margin }} ref={ref}>
			<div className={s.number}>{no + 1}</div>
			{goal}
		</div>
	)
}
