import React, {useState, useEffect} from 'react'
import {useDispatch} from "react-redux"

import s from './Landing.module.sass'

export default function Landing() {

	const dispatch = useDispatch()
	const [mode, setMode] = useState('portrait')
	const [orientation, setOrientation] = useState({})

	useEffect(() => {
		bindDeviceSensors()
	}, [])

	function getPermissions() {
		DeviceMotionEvent.requestPermission().then(response => {
			if (response === 'granted') {
				// Add a listener to get smartphone orientation
				// in the alpha-beta-gamma axes (units in degrees)
				bindDeviceSensors()
			}
		});
	}

	function bindDeviceSensors() {
		window.addEventListener('deviceorientation',(event) => {
			// Expose each orientation angle in a more readable way
			let alpha = event.alpha.toFixed(0)
			let currentOrientation
			let inverted = false
			switch (true) {
				case alpha >= 315 || alpha < 45:
					currentOrientation = 'portrait'
					break
				case  alpha >= 45 && alpha < 135:
					currentOrientation = 'landscape'
					break
				case alpha >= 135 && alpha < 225:
					currentOrientation = 'portrait'
					inverted = true
					break
				default:
					currentOrientation = 'landscape'
					inverted = true
					break
			}
			setMode(currentOrientation + ' ' + inverted)

			// Portrait = gamma, landscape = beta

			setOrientation({
				alpha: event.alpha.toFixed(0),
				beta: event.beta.toFixed(0),
				gamma: event.gamma.toFixed(0)
			})
		})
	}

	return (
		<div className={s.wrapper}>
			<div className={s.text}>Please allow access to your accelerometer</div>
			<button onClick={getPermissions}>Will do</button>
			<div>no thanks</div>

			<div>
				<div>{mode}</div>
				{JSON.stringify(orientation)}
			</div>
		</div>
	)

}
