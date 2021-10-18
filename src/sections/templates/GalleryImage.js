import React from 'react'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import s from './GalleryImage.module.sass'

export default function GalleryImage({ src }) {

	const [ref, inView] = useInView()

	return (
		<div className={s.wrapper} ref={ref}>
			<div className={cx(s.image, { [s.active]: inView })}>
				<img src={src} />
				<div className={s.text}>
					Use the app on a device mounted to a mechanized track to take an Augmented Reality video
				</div>
			</div>
		</div>
	)
}
