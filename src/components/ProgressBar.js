import React, {useState, useEffect} from 'react'
import {useSelector} from "react-redux"

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
			setTimeout(() => {
				document.querySelector('.page').addEventListener('scroll', handleScroll)
			}, 1400)
		}
	}, [progressBarActive])

	function getPageHeight() {
		let page = document.querySelector('.page-inner')
		console.log(page)
		// setPageHeight(page.getBoundingClientRect().height)
	}

	function handleScroll() {
		if (!pageHeight) getPageHeight()
		let dot = document.querySelector('.' + s.dot)
		let scroll = document.querySelector('.page').scrollTop
		console.log(scroll)
		// console.log(scroll, pageHeight, window.innerHeight)
		let top = scroll / (pageHeight - windowDimensions.height) * 100
		console.log(pageHeight, windowDimensions.height)
		dot.style.top = top + '%'
	}

	return (
		<div className={s.wrapper}>
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
