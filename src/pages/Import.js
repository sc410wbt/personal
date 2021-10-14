import React, { useState, useEffect } from 'react'
import {useDispatch} from "react-redux"
import * as THREE from "three"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

import { addCustomMap } from "../Environment"

import s from './Import.module.sass'

const existing = ['none', 'rhino', 'android', 'shiba']

const models = [
	{
		name: 'Android',
		scale: 1.5,
		src: '/models/android/scene.gltf'
	},
	{
		name: 'Rhino',
		src: '/models/rhino/scene.gltf'
	},
	{
		name: 'Shiba Puppy',
		src: '/models/shiba/scene.gltf'
	},
]

function ImportPage() {

	const dispatch = useDispatch()
	const [map, setMap] = useState()
	const [count, setCount] = useState(0)

	useEffect(() => {
		dispatch({ type: 'SET_SCENE_POSITION', position: 'left' })
	}, [])

	function handlePreview(name) {
		console.log('preview?')
		dispatch({ type: 'SET_OBJECT', object: name })
	}

	function handleClick(model) {
		getPoints(model.src)
			.then(res => {
				console.log('res returned', res)
				let json = JSON.stringify(res)
				setMap(json)
				addCustomMap(res, count)
				dispatch({ type: 'SET_OBJECT', object: 'custom' + count })
				setCount(count + 1)
			})
	}

	let previews = existing.map(name => <button onClick={e => handlePreview(name)}>{name}</button>)

	let modelOptions = models.map(model => {
		return <button onClick={e => handleClick(model)}>{model.name}</button>
	})

	return (
		<div className={s.wrapper}>
			View existing models
			<div>
				{previews}
			</div>
			Import point data from GLTF files
			<div className={s.options}>
				{modelOptions}
			</div>
			<div className={s.map}>
				{map}
			</div>
		</div>
	)

}

async function getPoints(src) {
	let loader = new GLTFLoader()
	let object = await loader.loadAsync(src)

	let arr = []
	object.scene.traverse(function (child) {
		if (child.isMesh) {
			console.log(child.geometry)
			let meshArr = processObject(child.geometry, { rotation: { x: -Math.PI / 2, y: 0, z: 0 } })
			console.log('mesh array', meshArr)
			arr = arr.concat(meshArr)
		}
	})
	return arr
}



function processObject(geometry, options) {
	// check out the position attribute of a cube
	options = {
		scale: 2,
		max: 500,
		...options
	}
	let group = new THREE.Group()
	let triangles = []
	let totalArea = 0

	const map = new THREE.TextureLoader().load( '/images/sprite.png' )
	const material = new THREE.SpriteMaterial({ map: map })

	let position = geometry.getAttribute('position')
	let positions = position.array
	let index = geometry.getIndex()

	console.log('object processing: computing triangles')
	for (let i = 0; i < index.count; i += 3) {
		let indices = [index.array[i], index.array[i + 1], index.array[i + 2]]
		let x = positions[indices[0] * 3] * options.scale
		let y = positions[indices[0] * 3 + 1] * options.scale
		let z = positions[indices[0] * 3 + 2] * options.scale
		let x2 = positions[indices[1] * 3] * options.scale
		let y2 = positions[indices[1] * 3 + 1] * options.scale
		let z2 = positions[indices[1] * 3 + 2] * options.scale
		let x3 = positions[indices[2] * 3] * options.scale
		let y3 = positions[indices[2] * 3 + 1] * options.scale
		let z3 = positions[indices[2] * 3 + 2] * options.scale

		// Calculate the area of the triangle
		let va = { X: x, Y: y, Z: z }
		let vb = { X: x2, Y: y2, Z: z2 }
		let vc = { X: x3, Y: y3, Z: z3 }

		let ab = { X: vb.X - va.X, Y: vb.Y - va.Y, Z: vb.Z - va.Z }
		let ac = { X: vc.X - va.X, Y: vc.Y - va.Y, Z: va.Z - vc.Z }
		let cross = new THREE.Vector3()
		cross = crossVectors(ab, ac)
		let area = Math.sqrt(Math.pow(cross.X,2)+Math.pow(cross.Y,2)+Math.pow(cross.Z,2))/2
		totalArea += area
		console.log('area', area)

		let triangleData = [x, y, z, x2, y2, z2, x3, y3, z3, area]
		triangles.push(triangleData)
	}

	console.log('total area is', totalArea)
	console.log(triangles, triangles.length)

	let spritesPerUnit = options.max / totalArea
	console.log('allow ', spritesPerUnit, 'sprites')

	let spriteScale = 0.02
	let totalSprites = 0

	for (let triangle of triangles) {
		let allowedSprites = spritesPerUnit * triangle[9]
		let remainder = allowedSprites % 1
		allowedSprites = Math.floor(allowedSprites)
		console.log(`allow ${allowedSprites} sprite(s) in this triangle with ${remainder} remainder`)
		if (Math.random() < remainder) allowedSprites++
		console.log('allow additional from computed chance', allowedSprites)

		if (!allowedSprites) continue
		for (let n = 0; n <= allowedSprites; n++) {
			let spriteX = getRandomPointBetween(triangle[0], triangle[3], triangle[6])
			let spriteY = getRandomPointBetween(triangle[1], triangle[4], triangle[7])
			let spriteZ = getRandomPointBetween(triangle[2], triangle[5], triangle[8])
			let sprite = new THREE.Sprite(material)

			sprite.position.set(spriteX, spriteY, spriteZ)
			sprite.scale.set(spriteScale, spriteScale, spriteScale)
			group.add(sprite)
			totalSprites++
		}
	}

	console.log(`${totalSprites} total sprites added`)

	console.log('object processing: getting rotated positions')
	group.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z)
	let points = []
	group.children.forEach(sprite => {
		let target = new THREE.Vector3()
		sprite.getWorldPosition(target)
		// points.push([sprite.position.x, sprite.position.y, sprite.position.z])
		points.push([target.x, target.y, target.z])
	})
	console.log('world position translated points', points)

	return points
}

function crossVectors( a, b ) {
	let ax = a.X, ay = a.Y, az = a.Z
	let bx = b.X, by = b.Y, bz = b.Z
	let P = { X: ay * bz - az * by,
		Y: az * bx - ax * bz,
		Z: ax * by - ay * bx}
	return P
}

function getRandomPointBetween(a, b, c) {
	let max = Math.max(a, b, c)
	let min = Math.min(a, b, c)
	return Math.random() * (max - min) + min
}

export default ImportPage
