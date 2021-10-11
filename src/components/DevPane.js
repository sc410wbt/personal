import React from 'react'
import { useSelector } from "react-redux"

import s from './DevPane.module.sass'

export default function DevPane() {

	const sceneRotation = useSelector(state => state.system.sceneRotation)

	return (
		<div className={s.dev}>
			<button>toggle object</button>
			<div>
				clientX: {sceneRotation.x}<br />
				clientY: {sceneRotation.y}
			</div>
		</div>
	)
}
