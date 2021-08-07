import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

import s from './Nav.module.sass'

const links = {
	rhino: {
		name: 'home'
	},
	ring: {
		name: 'inspiration museum'
	},
	android: {
		name: 'augmented reality'
	}
}

function Nav(props) {

	const dispatch = useDispatch()
	const banner = useSelector(state => state.banner)

	function switchBanner(banner) {
		dispatch({ type: 'SET_BANNER', banner: banner})
	}

	let nav = Object.entries(links).map(([key, value]) => {
		return (
			<Link to={"/something"} onClick={() => switchBanner(key)}>{value.name}</Link>
		)
	})

	return (
		<div className={s.wrapper}>
			{nav}<div>{props.history.location.pathname}</div>
		</div>
	)

}

export default withRouter(Nav)
