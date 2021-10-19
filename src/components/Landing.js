import React, {useState, useEffect} from 'react'
import {useDispatch} from "react-redux"
import cx from 'classnames'

import s from './Landing.module.sass'

export default function Landing() {

	const dispatch = useDispatch()
	const [os, setOS] = useState('')
	const [active, setActive] = useState(true)
	const [mode, setMode] = useState('portrait')
	const [orientation, setOrientation] = useState({})

	useEffect(() => {
		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
			// true for mobile device
			setActive(true)
			if(/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
				setOS('ios')
			}
			bindDeviceSensors()
		}else{
			// false for not mobile device
			setActive(false)
		}
	}, [])

	function getPermissions() {
		DeviceMotionEvent.requestPermission().then(response => {
			if (response === 'granted') {
				// Add a listener to get smartphone orientation
				// in the alpha-beta-gamma axes (units in degrees)
				bindDeviceSensors()
				setActive(false)
			}
		});
	}

	function bindDeviceSensors() {
		window.addEventListener('deviceorientation', handleOrientationEvent)
	}

	function handleOrientationEvent(event) {
		// Expose each orientation angle in a more readable way
		if (active) setActive(false)
		let alpha = event.alpha.toFixed(0)
		let currentOrientation
		let inverted = false
		let verticalInverted = false
		switch (true) {
			case alpha >= 315 || alpha < 45:
				currentOrientation = 'portrait'
				break
			case  alpha >= 45 && alpha < 135:
				currentOrientation = 'landscape'
				verticalInverted = true
				break
			case alpha >= 135 && alpha < 225:
				currentOrientation = 'portrait'
				inverted = true
				verticalInverted = true
				break
			default:
				currentOrientation = 'landscape'
				inverted = true
				break
		}
		setMode(currentOrientation + ' ' + inverted)

		// Portrait = gamma, landscape = beta
		let beta = event.beta.toFixed(2)
		let gamma = event.gamma.toFixed(2)
		let y = 0
		let x = 0

		let val = currentOrientation === 'portrait' ? gamma : beta
		if (os !== 'ios') val = gamma
		if (inverted) val = 0 - val
		if (val < 0) y = Math.max(-25, val) / 50
		else y = Math.min(25, val) / 50

		let vertical = currentOrientation === 'portrait' ? beta : gamma
		if (os !== 'ios') vertical = beta
		if (inverted) vertical = 0 - vertical
		if (vertical > 60) vertical = 60
		else if (vertical < 10) vertical = 10
		x = ((vertical - 10) / 50) * 0.2 - 0.1

		dispatch({ type: 'SET_ROTATION', rotation: { y: y, x: x }})


		setOrientation({
			alpha: alpha,
			beta: beta,
			gamma: gamma
		})
	}


	return (
		<div className={cx(s.wrapper, { [s.active]: active })}>
			<div className={s.text}>
				<div className={s.welcome}>Thanks for stopping by!</div>
				<strong>Please allow access to your accelerometer.</strong>
			</div>
			<button onClick={getPermissions}>Will do</button>
			<div className={s.decline} onClick={() => setActive(false)}>no thanks</div>

			{/*<div>*/}
			{/*	<div>{mode}</div>*/}
			{/*	{JSON.stringify(orientation)}*/}
			{/*</div>*/}
		</div>
	)

}
