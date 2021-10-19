import React, {useEffect, useRef} from 'react'
import {useDispatch, useSelector} from "react-redux"

import ScrollProgress from '../../components/ScrollProgress'

import TitleTemplate from "../../sections/templates/Title"
import IntroTemplate from "../../sections/templates/Intro"
// import SharingSection from "../../sections/projects/ARBooth/Sharing"
// import PhotosSection from "../../sections/projects/ARBooth/Photos";
import GallerySection from "../../sections/projects/ARBooth/Gallery"
import NumbersSection from "../../sections/projects/ARBooth/Numbers"
import SidePanelTemplate from "../../sections/templates/SidePanel"

import technicalDrawing from '../../media/projects/ARBooth/technical-drawing.jpg'

function ARBoothPage() {

	const goals = [
		'Appease clients with a photo booth for events',
		'But make it techy',
		'And then make it modifiable for future use'
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
				<TitleTemplate title={"AR Immersion Booth"} object={"camera"} />
				<IntroTemplate goals={goals}
							   title={<div>How to make a<br />shareable AR Boomerang</div>}
				   	subtitle={"in 4 easy steps"}
					/>

				<SidePanelTemplate
					title={"Develop an ARCore app"}
					content={<div>
						The most powerful augmented reality SDKs are baked into mobile operating systems taking most of the pain out of development. They include complex features such as body occlusion and depth perception
					</div>}
				/>

				<SidePanelTemplate
					title={"Measure Everything"}
					content={<div>
						Develop structure for a booth taking into account physical space as well and degrees of arc and camera field of view
						<img src={technicalDrawing} />
					</div>}
					object={"phone"}
					/>
				{/*<StageSection />*/}
				<GallerySection />
				<NumbersSection />
				{/*<PhotosSection />*/}
				{/*<SharingSection />*/}
			</div>
		</div>
	)
}

export default ARBoothPage
