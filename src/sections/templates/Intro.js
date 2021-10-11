import React from 'react'

import s from './Intro.module.sass'

export default function IntroTemplate({ text }) {

	return (
		<div className={s.wrapper}>
			<div className={s.panel}>
				{text}
			</div>
		</div>
	)

}
