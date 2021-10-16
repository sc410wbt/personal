import React from 'react'
import TitleTemplate from "../../sections/templates/Title"
import IntroTemplate from "../../sections/templates/Intro"
import ScrollProgress from "../../components/ScrollProgress"

export default function InspirationMuseumPage() {

	return (
		<div className={"page"}>
			<div style={{ position: 'relative' }}>
				<ScrollProgress />
				<TitleTemplate title={"Inspiration Museum"} object={"rhino"}/>
				<IntroTemplate />
			</div>
		</div>
	)

}
