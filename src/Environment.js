import React, {useState, useEffect} from 'react'
import {useSelector} from "react-redux"
import * as THREE from 'three'
import {Geometry} from "three/examples/jsm/deprecated/Geometry";
import * as TWEEN from 'tween'
// import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader"
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import * as _ from 'lodash'

import AndroidMap from './maps/android.json'
import ShibaMap from './maps/shiba.json'
import RhinoMap from './maps/rhino.json'

import formulateSprites from "./library/Loader"


import s from './Environment.module.sass'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RingBufferGeometry} from "three";

// const Android = require('maps/android.json')
const currentMap = ShibaMap

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true })
let camera
let controls
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let pauseAnimation = false
let spriteMaps = []
let clickable = []
let lights = {}

let dragTimer
let azimuthalAngle // side to side
let polarAngle // up, down
let dragging = false

let frames = 0
let frameTimer
let windowWidth
let windowHeight

let fov = (window.innerWidth < 760) ? 60 : 45

// options
const enableShadows = false

let spinningParticles = new THREE.Group()
let spinningDormant = new THREE.Group()
let bannerGroup = new THREE.Group()
let particleGroup = new THREE.Group()
let border

const spriteMaterial = new THREE.SpriteMaterial({
	map: new THREE.TextureLoader().load('/images/sprite.png'),
})
const spriteTransitionMaterial = new THREE.SpriteMaterial({
	map: new THREE.TextureLoader().load('/images/sprite.png'),
	transparent: true,
	opacity: 1
})

export default function Environment() {

	const [active, setActive] = useState(true)
	const banner = useSelector(state => state.banner)
	const page = useSelector(state => state.page)

	useEffect(() => {

		windowWidth = window.innerWidth
		windowHeight = window.innerHeight

		const appWrapper = document.querySelector('.' + s.webgl)
		// console.log(appWrapper)
		if (appWrapper.children.length <= 0) appWrapper.appendChild(renderer.domElement)

		camera = new THREE.PerspectiveCamera(fov, windowWidth/ windowHeight, 0.1, 300)
		camera.position.set(0,15, 20)
		camera.lookAt(0, 0, 0)
		renderer.setClearColor(0x222222, 0)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap

		// controls = new OrbitControls(camera, renderer.domElement)
		// controls.enableZoom = true
		// controls.enableDamping = true
		// controls.dampingFactor = 0.12
		// controls.rotateSpeed *= 0.4

		populate()
		light()
		animate()

	}, [])

	useEffect(() => {
		console.log('page is changing', page)
		if (spriteMaps[page]) { // Make sure there have been things added to it

			console.log('should rotate', bannerGroup.rotation, bannerGroup.children)
			new TWEEN.Tween({y: 0}).to({y: Math.PI * 4}, 2500)
				.easing(TWEEN.Easing.Exponential.InOut)
				.onUpdate(function() {
					bannerGroup.rotation.y = this.y
				})
				.onComplete(function() {
					console.log('animation completed', bannerGroup.rotation)
					bannerGroup.rotation.set(0, 0, 0)
				})
				.start()


			let currentSprites = bannerGroup.children.length
			let spriteMap = spriteMaps[page]
			let targetSprites = spriteMap.length
			console.log('sprite from', currentSprites, 'to', targetSprites)

			for (let x = 0; x < Math.min(currentSprites, targetSprites); x++) {
				let sprite = bannerGroup.children[x]
				let target = spriteMap[x]
				// console.log('target', sprite, target)
				// sprite.position.set(...target)
				let position = sprite.position
				new TWEEN.Tween({ x: position.x, y: position.y, z: position.z }).to({ x: target[0], y: target[1], z: target[2] }, 2500)
					.easing(TWEEN.Easing.Exponential.InOut)
					.onUpdate(function() {
						sprite.position.set(this.x, this.y, this.z)
					})
					.start()
			}

			if (currentSprites === targetSprites) {
				// do nothing
			} else if (currentSprites > targetSprites) { // Delete remaining
				console.log('removing sprites')
				spriteTransitionMaterial.opacity = 1
				for (let x = currentSprites - 1; x > targetSprites; x--) {
					let sprite = bannerGroup.children[x]
					sprite.material = spriteTransitionMaterial
					let pos = sprite.position
					new TWEEN.Tween({ x: pos.x, y: pos.y, z: pos.z }).to({ ...getRandomOutwardPosition(pos.x, pos.y, pos.z) }, 2500)
						.easing(TWEEN.Easing.Exponential.InOut)
						.onUpdate(function() {
							sprite.position.set(this.x, this.y, this.z)
						})
						.onComplete(function() {
							bannerGroup.remove(sprite)
						})
						.start()
				}
				new TWEEN.Tween({ opacity: 1 }).to({ opacity: 0}, 2500)
					.easing(TWEEN.Easing.Exponential.InOut)
					.onUpdate(function() {
						spriteTransitionMaterial.opacity = this.opacity
					})
					.start()
				// console.log('bannerGroup size', bannerGroup.children.length)
			} else { // Add more
				// console.log('adding more sprites')
				spriteTransitionMaterial.opacity = 0
				for (let x = currentSprites; x < targetSprites; x++) {
					let coords = spriteMap[x]
					const sprite = new THREE.Sprite(spriteTransitionMaterial)
					sprite.scale.set(...randomizeSpriteScale())
					sprite.position.set(0, 0, 0)
					bannerGroup.add(sprite)
					new TWEEN.Tween({ ...getRandomOutwardPosition(coords[0], coords[1], coords[2]) }).to({ x: coords[0], y: coords[1], z: coords[2] }, 3000)
						.easing(TWEEN.Easing.Exponential.InOut)
						.onUpdate(function() {
							sprite.position.set(this.x, this.y, this.z)
						})
						.onComplete(() => {
							sprite.material = spriteMaterial
						})
						.start()
				}
				new TWEEN.Tween({ opacity: 0 }).to({ opacity: 1}, 2500)
					.easing(TWEEN.Easing.Exponential.InOut)
					.onUpdate(function() {
						spriteTransitionMaterial.opacity = this.opacity
					})
					.start()
			}





		}
	}, [page])


	function getRandomOutwardPosition(x, y, z) {
		return {
			x: 0,
			y: 0,
			z: 0
		}
	}

	function scatterParticles() {
		new TWEEN.Tween({ inner: 6, outer: 6.25 }).to({ inner: 5.25, outer: 7 }, 1000)
			.easing(TWEEN.Easing.Back.InOut)
			.onUpdate(function() {
				if (border) {
					let newGeom = new THREE.RingBufferGeometry(this.inner, this.outer, 100)
					border.geometry.dispose()
					border.geometry = newGeom
				}
			})
			.start()

		for (let x = 0; x < particleGroup.children.length; x++) {
			let particle = particleGroup.children[x]
			// console.log(particle)
			new TWEEN.Tween({ y: particle.position.y }).to({ y: -2 }, 1000)
				.easing(TWEEN.Easing.Exponential.InOut)
				.onUpdate(function() {
					particle.position.y = this.y
				})
				.onComplete(() => {
					setActive(false)
				})
				.start()
		}
	}

	function formParticles() {
		new TWEEN.Tween({ inner: 5.25, outer: 7 }).to({ inner: 6, outer: 6.25 }, 1000)
			.easing(TWEEN.Easing.Back.InOut)
			.onUpdate(function() {
				// if (border) {
					let newGeom = new THREE.RingBufferGeometry(this.inner, this.outer, 100)
					border.geometry.dispose()
					border.geometry = newGeom
				// }
			})
			.start()

		for (let x = 0; x < particleGroup.children.length; x++) {
			let particle = particleGroup.children[x]
			let origin = currentMap[x]
			// console.log(particle, origin)
			new TWEEN.Tween({ y: particle.position.y }).to({ y: origin[1] }, 1000)
				.easing(TWEEN.Easing.Exponential.InOut)
				.onUpdate(function() {
					particle.position.y = this.y
				})
				.onComplete(() => setActive(true))
				.start()
		}
	}

	function addSpinning() {
		let particleGeom = new THREE.SphereBufferGeometry(0.05, 16, 8)
		let particleMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		for (let x = 0; x < 100; x++) {
			let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 1 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 1 + 6)  * Math.sin(theta) - Math.cos(theta)
			particle.position.set(x, -0.1 - Math.random(),  z)
			// particle.position.set(3 + Math.random() * 2, -1 + Math.random() * 3, 2 + Math.random() * 2)
			spinningParticles.add(particle)
		}
		scene.add(spinningParticles)

		for (let x = 0; x < 100; x++) {
			let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 1 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 1 + 6)  * Math.sin(theta) - Math.cos(theta)
			particle.position.set(x, -0.1 - Math.random(),  z)
			// particle.position.set(3 + Math.random() * 2, -1 + Math.random() * 3, 2 + Math.random() * 2)
			spinningDormant.add(particle)
		}
		scene.add(spinningDormant)
	}

	async function populate() {
		// addGuides()
		addSpinning()

		let planeGeom = new THREE.PlaneBufferGeometry(1000, 1000)
		let planeMat = new THREE.MeshPhysicalMaterial({
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0.8
		})
		let plane = new THREE.Mesh(planeGeom, planeMat)
		plane.rotation.set(-Math.PI / 2, 0, 0)
		plane.receiveShadow = enableShadows
		scene.add(plane)

		let shadeGeom = new THREE.PlaneBufferGeometry(400, 400)
		let shadeMat = new THREE.MeshBasicMaterial({
			color: 0x333333,
			transparent: true,
			opacity: 0.015
		})
		let shade = new THREE.Mesh(shadeGeom, shadeMat)
		shade.rotation.set(-Math.PI / 2, 0, Math.PI / 4)
		shade.position.set(-141.3, 0.01, -141.3)
		shade.renderOrder = 1
		scene.add(shade)

		let borderGeom = new THREE.RingBufferGeometry(6, 6.25, 100)
		let borderMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		border = new THREE.Mesh(borderGeom, borderMat)
		border.position.set(0, 0.1, 0)
		border.rotation.set(-Math.PI / 2, 0, 0)
		scene.add(border)

		// let circleGeom = new THREE.CircleBufferGeometry(10, 30)
		// let circleMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		// let circle = new THREE.Mesh(circleGeom, circleMat)
		// circle.rotation.set(-Math.PI / 2, 0, 0)
		// circle.position.set(0, 0.01, 0)
		// scene.add(circle)

		// let cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
		// let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, metalness: 1, roughness: 1 })
		//
		// let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		// cube.position.set(0, 0, 0)
		// bannerGroup.add(cube)
		// console.log(cubeGeometry.attributes.position)

		let mtlFile = '/models/cartier_room.mtl'
		let mtlLoader = new MTLLoader()
		let materials = await mtlLoader.loadAsync(mtlFile)
		// console.log('materials', materials)


		// let loader = new OBJLoader()
		// loader.setMaterials(materials)
		//
		// let model = '/models/cartier_room.obj'
		// loader.load(model, (object) => {
		// 	object.scale.set(0.01,0.01,0.01)
		// 	object.position.set(0, -20, 0)
		// 	object.rotation.y = Math.PI / 12
		// 	console.log('loaded', object.children)
		// 	scene.add(object)
		// }, () => {
		// 	console.log('error')
		// })


		// spriteMaps['/'] = await formulateSprites('/models/rhino/scene.gltf', {
		// 	scale: 5.0,
		// 	position: [-0.5, -3, 0],
		// 	rotation: [0 - Math.PI / 2, 0, 0 - Math.PI / 2],
		// 	minDistance: 0.5,
		// 	maxDistance: 1.5
		// })
		// addToBanner(spriteMaps['/'])
		//
		// spriteMaps['/inspiration-museum'] = await formulateSprites('/models/ring/scene.gltf', {
		// 	scale: 4.0,
		// 	rotation: [-0.9, 0.25, 0],
		// 	minDistance: 0.1,
		// 	maxDistance: 5
		// })
		// // addToBanner(spriteMaps['ring'])
		//
		// spriteMaps['/ar-booth'] = await formulateSprites('/models/android/scene.gltf', {
		// 	scale: 2.5,
		// 	position: [0, 2, 0],
		// 	rotation: [0 - Math.PI / 2, 0, 0],
		// 	minDistance: 0.1,
		// 	maxDistance: 0.7
		// })

		// addBannerWobble()

		loadFromJson()
	}

	function loadFromJson() {
		// const map = new THREE.TextureLoader().load( '/images/sprite.png' )
		// const material = new THREE.SpriteMaterial({ map: map })
		let points = currentMap
		let particleGeom = new THREE.SphereBufferGeometry(0.05, 16, 8)
		let particleMat = new THREE.MeshToonMaterial({ color: 0x333333 })
		points.forEach(point => {
			let particle = new THREE.Mesh(particleGeom, particleMat)
			particle.position.set(point[0], point[1], point[2])
			particle.castShadow = enableShadows
			particleGroup.add(particle)

			// let sprite = new THREE.Sprite(material)
			// sprite.position.set(point[0], point[1], point[2])
			// sprite.scale.set(0.1,0.1,0.1)
			// sprite.castShadow = true
			// rotatedGroup.add(sprite)
		})
		console.log(particleGroup)
		// rotatedGroup.position.set(0, -5, 0)

		scene.add(particleGroup)
	}





	function addBannerWobble() {
		setInterval(() => {
			let intensity = 0.1
			new TWEEN.Tween({ x: bannerGroup.rotation.x, y: bannerGroup.rotation.y, z: bannerGroup.rotation.z })
				.to({ x: (Math.random() - 0.5) * intensity, y: (Math.random() - 0.5) * intensity, z: (Math.random() - 0.5) * intensity }, 2000)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(function() {
					bannerGroup.rotation.set(this.x, this.y, this.z)
				})
				.start()
		}, 2000)
	}

	async function addToBanner(spriteMap) {
		const map = await new THREE.TextureLoader().load( '/images/sprite.png' )
		// console.log('sprite map', map)
		const material = new THREE.SpriteMaterial({ map: map })
		for (let coords of spriteMap) {
			const sprite = new THREE.Sprite(material)
			sprite.scale.set(0.1, 0.1, 0.1)
			// sprite.scale.set(...randomizeSpriteScale())
			sprite.position.set(...coords)
			bannerGroup.add(sprite)
		}
		scene.add(bannerGroup)
	}

	function addGuides() {
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xd81921,
			transparent: true,
			opacity: 0.5
		})

		const points = []
		points.push( new THREE.Vector3( 0, 0, 0 ) )
		points.push( new THREE.Vector3( 0, 0, 20 ) )

		const geometry = new THREE.BufferGeometry().setFromPoints( points )

		const line = new THREE.Line( geometry, new THREE.LineBasicMaterial({
			color: 0xd81921,
			transparent: true,
			opacity: 0.5
		}))
		scene.add( line )

		const pointsY = []
		pointsY.push( new THREE.Vector3( 0, 0, 0 ) )
		pointsY.push( new THREE.Vector3( 0, 20, 0 ) )

		const geometryY = new THREE.BufferGeometry().setFromPoints( pointsY )

		const lineY = new THREE.Line( geometryY, new THREE.LineBasicMaterial({
			color: 0x6cbd38,
			transparent: true,
			opacity: 0.5
		}) )
		scene.add( lineY )

		lineMaterial.color.set(0x69FFFF)

		const pointsZ = []
		pointsZ.push( new THREE.Vector3( 0, 0, 0 ) )
		pointsZ.push( new THREE.Vector3( 20, 0, 0 ) )

		const geometryZ = new THREE.BufferGeometry().setFromPoints( pointsZ )

		const lineZ = new THREE.Line( geometryZ, lineMaterial )
		scene.add( lineZ )
	}



	let dLight
	function light() {
		let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8)
		scene.add(ambientLight)

		dLight = new THREE.DirectionalLight(0xFFFFFF, 1)
		dLight.position.set(camera.position.x, 10, 2)
		dLight.castShadow = enableShadows
		scene.add(dLight)
	}

	function animate() {
		frames++
		// scene.rotation.y += 0.005
		spinningParticles.rotation.y += 0.005
		spinningDormant.rotation.y += 0.001

		dLight.position.set(camera.position.x, 10, 2)

		// bannerGroup.rotation.y -= 0.004

		TWEEN.update()
		requestAnimationFrame(animate)

		renderer.render(scene, camera)
	}

	function handleClick(e) {
		e.preventDefault()
		if (active) {
			scatterParticles()
		} else {
			formParticles()
		}
	}

	let movementTween
	function handleMouseMove(e) {
		let y = e.clientX / windowWidth
		let x = e.clientY / windowHeight
		// scene.rotation.y = -1 + (y * 2)
		// scene.rotation.x = -0.25 + (x * 0.5)
		if (movementTween) movementTween.stop()
		movementTween = new TWEEN.Tween({ y: scene.rotation.y, x: scene.rotation.x}).to({ y: -1 + (y * 2), x: -0.25 + (x * 0.5)}, 150)
			// .easing(TWEEN.Easing.Elastic.InOut)
			.onUpdate(function() {
				scene.rotation.y = this.y
				scene.rotation.x = this.x
			})
			.start()
	}

	return (
		<div>
			<div className={s.webgl}
				onMouseMove={_.throttle(handleMouseMove, 100)}
				/>
			<div className={s.dev}>
				<button onClick={handleClick}>toggle object</button>
			</div>
		</div>
	)

}


function randn_bm() {
	let u = 0, v = 0;
	while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while(v === 0) v = Math.random();
	return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
}

function randomizeSpriteScale() {
	let baseScale = 0.02
	let randomScale = baseScale + 0.12 * randn_bm()
	// if (randomScale > 0.12) console.log('final scale', randomScale)
	return [randomScale, randomScale, randomScale]
}
