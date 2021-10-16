import React from 'react'

import ScrollProgress from '../components/ScrollProgress'

import TitleTemplate from "../sections/templates/Title"
import IntroTemplate from "../sections/templates/Intro"
import ARCoreSection from "../sections/projects/ARBooth/ARCore"
import SharingSection from "../sections/projects/ARBooth/Sharing"

function ARBoothPage() {

	return (
		<div className={"page"}>
			<div style={{ position: 'relative' }}>
				<ScrollProgress />
				<TitleTemplate title={"AR Immersion Booth"} object={"camera"} />
				<IntroTemplate text={"Create a photo booth experience unlike any other allowing brands to drop animated objects along with the subject"} />
				<ARCoreSection />
				<SharingSection />
			</div>
		</div>
	)
}

export default ARBoothPage
