import React from 'react'

import TitleTemplate from "../sections/templates/Title";
import IntroTemplate from "../sections/templates/Intro"
import ARCoreSection from "../sections/projects/ARBooth/ARCore"
import SharingSection from "../sections/projects/ARBooth/Sharing"

function ARBoothPage() {

	return (
		<div className={"page"}>
			<TitleTemplate title={"AR Immersion Booth"} />
			<IntroTemplate text={"Create a photo booth experience unlike any other allowing brands to drop animated objects along with the subject"} />
			<ARCoreSection />
			<SharingSection />
		</div>
	)
}

export default ARBoothPage
