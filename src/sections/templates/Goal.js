import React, {useEffect, useState} from 'react'

import s from './Goal.module.sass'

export default function Goal({ goal, no }) {

	const [margin, setMargin] = useState(0)

	useEffect(() => {
		setMargin(Math.random() * 70)
	}, [])

	return (
		<div className={s.goal} style={{ marginLeft: `${margin}%` }}>
			<div className={s.number}>{no + 1}</div>
			{goal}
		</div>
	)
}
