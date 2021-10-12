import React, {useState, useEffect} from 'react'
import * as _ from 'lodash'

import s from './ProgressBar.module.sass'

export default function ProgressBar() {

	const [height, setHeight] = useState(0)
	const [y, setY] = useState('hello')

	useEffect(() => {
		let page = document.querySelector('.page')
		let pageHeight = page.clientHeight
		console.log('page height', pageHeight)
		setHeight(pageHeight)
		console.log(height)
		// console.log('set y not doing anything')
		// setY('world')

		document.querySelector('body').addEventListener('scroll', _.throttle(handleScroll, 10))
	}, [])

	function handleScroll() {
		// console.log('scrolling')
		let height = document.querySelector('.page').clientHeight
		let scroll = document.querySelector('body').scrollTop
		console.log(scroll, height)
		let computedY = scroll / (height - window.innerHeight - 80) * 100
		console.log('y', computedY, y)
		let dot = document.querySelector('.' + s.dot)
		dot.style.top = computedY + '%'
	}

	return (
		<div className={s.wrapper}>
			<div className={s.cap} />
			<div className={s.cap} />
			<div className={s.line} />
			<div className={s.inner}>
				<div className={s.dot} />
			</div>
		</div>
	)

}
