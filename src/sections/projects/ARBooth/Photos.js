import React, {useEffect} from 'react'
import {useDispatch} from "react-redux"
import {useInView} from "react-intersection-observer"
import cx from 'classnames'

import {addPhotos, setCameraPosition, showGallery, hideGallery} from "../../../Environment"

import s from './Photos.module.sass'

export default function PhotosSection() {

	const dispatch = useDispatch()
	const [ref, inView] = useInView()
	const photos = [
		'',
		'',
		'',
		'',
	]

	useEffect(() => {
		addPhotos(photos)
	}, [])

	useEffect(() => {
		if (inView) {
			setCameraPosition(-20, 5, -5, -20, 2, -20)
			showGallery()
			dispatch({ type: 'SET_SCENE_POSITION', position: 'center' })
			dispatch({ type: 'SET_ROTATION_OBJECT', object: 'photos' })
		} else {
			hideGallery()
			dispatch({ type: 'SET_ROTATION_OBJECT', object: 'stage' })
		}
	}, [inView])

	return (
		<section>
			<div ref={ref}></div>
			<div className={cx(s.prev, { [s.active]: inView })}>{'<'}</div>
			<div className={cx(s.next, { [s.active]: inView })}>{'>'}</div>
		</section>
	)

}
