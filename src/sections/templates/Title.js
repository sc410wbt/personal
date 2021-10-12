import React, {useEffect} from 'react'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {setCameraPosition} from "../../Environment"

import s from './Title.module.sass'

export default function TitleTemplate({ title, tags }) {

	const [ref, inView] = useInView()

	useEffect(() => {
		setCameraPosition(0, 15, 20)
	}, [inView])

	return (
		<div className={s.wrapper}>
			<div style={{ position: 'absolute', top: '50px' }} ref={ref} />
			{/*<div className={s.bg} />*/}
			<h1 id={"title"}>
				{title}
			</h1>
		</div>
	)

}
