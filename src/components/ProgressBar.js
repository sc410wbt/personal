import React, {useState, useEffect} from 'react'
import {useSelector} from "react-redux"
import cx from 'classnames'
import * as _ from 'lodash'

import s from './ProgressBar.module.sass'

export default function ProgressBar() {

	// const [pageHeight, setPageHeight] = useState()
	const {windowDimensions, progressBarActive, pageHeight} = useSelector(state => state.system)

	// let dot
	//
	// useEffect(() => {
	// 	dot = document.querySelector('.' + s.dot)
	// }, [])

	useEffect(() => {
		if (progressBarActive) {
			document.querySelector('.' + s.dot).style.top = 0
			setTimeout(() => {
				document.querySelector('.page').addEventListener('scroll', _.throttle(handleScroll, 20))
			}, 1400)
		}
	}, [progressBarActive])

	function handleScroll() {
		let dot = document.querySelector('.' + s.dot)
		let scroll = document.querySelector('.page').scrollTop
		// console.log(scroll)
		// console.log(scroll, pageHeight, window.innerHeight)
		let top = scroll / (pageHeight - windowDimensions.height) * 100
		// console.log(pageHeight, windowDimensions.height)
		dot.style.top = top + '%'
	}

	return (
		<div className={cx(s.wrapper, { [s.active]: progressBarActive })}>
			{/*<div className={s.cap} />*/}
			{/*<div className={s.cap} />*/}
			<div className={s.line} />
			<div className={s.inner}>
				<div className={s.track}>
					<div className={s.dot} />
				</div>
			</div>
		</div>
	)

}
