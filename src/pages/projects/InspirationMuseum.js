import React, {useEffect} from 'react'
import TitleTemplate from "../../sections/templates/Title"
import IntroTemplate from "../../sections/templates/Intro"
import ScrollProgress from "../../components/ScrollProgress"
import {useDispatch} from "react-redux";

export default function InspirationMuseumPage() {

	const goals = [
		'Engage VIP in retail stores',
		'Browse the rich catalog of Cartier designs',
		'Upsell them on a custom design'
	]

	const dispatch = useDispatch()

	useEffect(() => {
		console.log('ar booth page mounted')
		dispatch({ type: 'SET_PROGRESS_BAR', active: true })

		let pageHeight = document.querySelector('.page-inner').getBoundingClientRect().height
		dispatch({ type: 'SET_PAGE_HEIGHT', height: pageHeight })

	}, [])

	return (
		<div className={"page"}>
			<div className={"page-inner"} style={{ position: 'relative' }}>
				{/*<ScrollProgress />*/}
				<TitleTemplate title={"Inspiration Museum"} object={"rhino"}/>
				<IntroTemplate goals={goals} />
			</div>
		</div>
	)

}
