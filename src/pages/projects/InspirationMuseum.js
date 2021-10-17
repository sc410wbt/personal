import React from 'react'
import TitleTemplate from "../../sections/templates/Title"
import IntroTemplate from "../../sections/templates/Intro"
import ScrollProgress from "../../components/ScrollProgress"

export default function InspirationMuseumPage() {

	const goals = [
		'Engage VIP in retail stores',
		'Browse the rich catalog of Cartier designs',
		'Upsell them on a custom design'
	]

	return (
		<div className={"page"}>
			<div style={{ position: 'relative' }}>
				<ScrollProgress />
				<TitleTemplate title={"Inspiration Museum"} object={"rhino"}/>
				<IntroTemplate goals={goals} />
			</div>
		</div>
	)

}
