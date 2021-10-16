import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"

export default function HomePage() {

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch({ type: 'SET_OBJECT', object: 'none' })
		dispatch({ type: 'SET_TITLE', title: ''})
	}, [])

	return (
		<div>
			{}
		</div>
	)

}
