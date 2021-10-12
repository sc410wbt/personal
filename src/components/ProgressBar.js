import React, {useEffect} from 'react'

import s from './ProgressBar.module.sass'

export default function ProgressBar() {

	let pageHeight
	let dot

	useEffect(() => {
		let page = document.querySelector('.page')
		dot = document.querySelector('.' + s.dot)
		pageHeight = page.clientHeight
		document.addEventListener('scroll', handleScroll)
	}, [])

	function handleScroll() {
		let scroll = document.documentElement.scrollTop
		// console.log(scroll, pageHeight, window.innerHeight)
		let top = scroll / (pageHeight - window.innerHeight) * 100
		dot.style.top = top + '%'
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
