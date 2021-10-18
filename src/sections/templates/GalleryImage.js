import React from 'react'
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import s from './GalleryImage.module.sass'

export default function GalleryImage({ src, text }) {

	const [ref, inView] = useInView()

	return (
		<div className={s.wrapper} ref={ref}>
			<div className={cx(s.image, { [s.active]: inView })}>
				<div className={s.inner}>
					<img src={src} />
					<div className={s.text}>
						{text}
					</div>
				</div>

			</div>
		</div>
	)
}
