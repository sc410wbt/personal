import React, {useState, useEffect} from 'react'

import s from './Landing.module.sass'

export default function Landing() {

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
			setOrientation({
				alpha: event.alpha.toFixed(2),
				beta: event.beta.toFixed(2),
				gamma: event.gamma.toFixed(2)
			})
		})
	}

	return (
		<div className={s.wrapper}>
			<div className={s.text}>Please allow access to your accelerometer</div>
			<button onClick={getPermissions}>Will do</button>
			<div>no thanks</div>

			<div>
				{JSON.stringify(orientation)}
			</div>
		</div>
	)

}
