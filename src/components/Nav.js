import React from 'react'
import {useSelector, useDispatch} from 'react-redux'

import s from './Nav.module.sass'

const links = {
	rhino: {
		name: 'Home'
	},
	ring: {
		name: 'Inspiration Museum'
	},
	android: {
		name: 'Augmented Reality'
	}
}

export default function Nav() {

	const dispatch = useDispatch()
	const banner = useSelector(state => state.banner)

	function switchBanner(banner) {
		dispatch({ type: 'SET_BANNER', banner: banner})
	}

	let nav = Object.entries(links).map(([key, value]) => {
		return (
			<div onClick={() => switchBanner(key)}>{value.name}</div>
		)
	})

	return (
		<div className={s.wrapper}>
			{nav}<div>{banner}</div>
		</div>
	)

}


