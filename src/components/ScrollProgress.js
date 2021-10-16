import React from 'react'

import s from './ScrollProgress.module.sass'

export default function scrollProgress() {
	return (
		<div className={s.wrapper}>
			<div className={s.fade} />
			<div className={s.end}>
			<div className={s.text}>END</div>
			</div>
		</div>
	)
}
