import React from 'react'

import ScrollProgress from '../../components/ScrollProgress'

import TitleTemplate from "../../sections/templates/Title"
import IntroTemplate from "../../sections/templates/Intro"
import ARCoreSection from "../../sections/projects/ARBooth/ARCore"
import StageSection from "../../sections/projects/ARBooth/Stage";
import SharingSection from "../../sections/projects/ARBooth/Sharing"
import PhotosSection from "../../sections/projects/ARBooth/Photos";
import GallerySection from "../../sections/projects/ARBooth/Gallery"
import NumbersSection from "../../sections/projects/ARBooth/Numbers"

function ARBoothPage() {

	const goals = [
		'Appease clients with a photo booth for events',
		'But make it techy',
		'And then make it modifiable for future use'
	]

	return (
		<div className={"page"}>
			<div style={{ position: 'relative' }}>
				<ScrollProgress />
				<TitleTemplate title={"AR Immersion Booth"} object={"camera"} />
				<IntroTemplate goals={goals} />
				<ARCoreSection />
				<StageSection />
				<GallerySection />
				<NumbersSection />
				{/*<PhotosSection />*/}
				{/*<SharingSection />*/}
			</div>
		</div>
	)
}

export default ARBoothPage
