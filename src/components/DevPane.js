import React, {useState, useEffect} from 'react'
import {useLocation} from "react-router"
import {useSelector} from "react-redux"
import cx from 'classnames'

import s from './DevPane.module.sass'

export default function DevPane() {

	const [active, setActive] = useState(false)
	const location = useLocation()
	const { rotation, scenePosition, object } = useSelector(state => state.system)

	useEffect(() => {
		// console.log('query', location)
		if (location.search.indexOf('dev') > 0) setActive(true)
	})

	return (
		<div className={cx(s.dev, { [s.active]: active })}>
			{/*<button>toggle object</button>*/}
			<div>
				clientX: {rotation.x}<br />
				clientY: {rotation.y}<br />
				scenePosition: {JSON.stringify(scenePosition)}<br />
				object: {object}
				{/*this needs to be translated for device orientation*/}
				<div>Beta (side to side): {}</div>
				<div>Gamma (front to back): {}</div>
			</div>
		</div>
	)
}
