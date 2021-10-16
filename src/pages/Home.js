import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {setCameraPosition} from "../Environment"

import s from './Home.module.sass'

export default function HomePage() {

	const dispatch = useDispatch()

	useEffect(() => {
		setCameraPosition(0, 18, 18, 0, 0, -2)
		dispatch({ type: 'SET_OBJECT', object: 'none' })
		dispatch({ type: 'SET_TITLE', title: ''})
	}, [])

	return (
		<div className={s.wrapper}>
			<div>Inspiration Museum</div>
			<div>AR Immersion Booth</div>
			<div>...coming soon</div>
		</div>
	)

}
