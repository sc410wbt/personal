import React, {useState, useEffect} from 'react'
import {useSelector} from "react-redux"
import cx from 'classnames'
import * as THREE from 'three'
import {Geometry} from "three/examples/jsm/deprecated/Geometry"
import * as TWEEN from 'tween'
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader"
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import * as _ from 'lodash'

import AndroidMap from './maps/android.json'
import RhinoMap from './maps/rhino.json'
import CameraMap from './maps/camera.json'

import s from './Environment.module.sass'
import {RingBufferGeometry} from "three";

const maps = {
	rhino: RhinoMap,
	android: AndroidMap,
	camera: CameraMap
}
const currentMap = RhinoMap
let currentObject = 'none'
let objectTransitionTime = 500
const ringThickness = {
	constricted: { inner: 6, outer: 6.25 },
	expanded: { inner: 5.25, outer: 7 }
}

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true })
let camera
let camera2
let lookAt = [0, 0, 0]
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

let stage = new THREE.Group()
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

// export function rotateCamera() {
// 	let pos = camera.position
// 	new TWEEN.Tween({x: pos.x, y: pos.y, z: pos.z }).to({x: 7, y: 0, z: 0}, 1000)
// 		.easing(TWEEN.Easing.Exponential.InOut)
// 		.onUpdate(function () {
// 			camera.position.x = this.x
// 			// camera.position.y = this.y
// 			// camera.position.z = this.z
// 			camera.lookAt(this.x, 0, 0)
// 		})
// 		.start()
// }

export function setCameraTarget(x, y, z) {
	camera.lookAt(x, y, z)
}

export function setCameraPosition(x, y, z, lx, ly, lz) {
	let pos = camera.position
	let prevLookAt = [...lookAt]
	if (!lx) lx = lookAt[0]
	if (!ly) ly = lookAt[1]
	if (!lz) lz = lookAt[2]
	new TWEEN.Tween({x: pos.x, y: pos.y, z: pos.z, lx: prevLookAt[0], ly: prevLookAt[1], lz: prevLookAt[2] }).to({x: x, y: y, z: z, lx: lx, ly: ly, lz: lz }, 1000)
		.easing(TWEEN.Easing.Exponential.InOut)
		.onComplete(function() {
			lookAt = [lx, ly, lz]
		})
		.onUpdate(function () {
			camera.position.x = this.x
			camera.position.y = this.y
			camera.position.z = this.z
			camera.lookAt(lx, ly, lz)
		})
		.start()
}

export function addCustomMap(json, x) {
	maps[`custom${x}`] = json
	console.log(maps)
}

export function hideObject() {
	transformRing('expanded')
}

export function showObject() {
	transformRing('constricted')
}

function expandRing() {
	transformRing('expanded')
}

function constrictRing() {
	transformRing('constricted')
}

function transformRing(type) {
	let origin = ringThickness[type === 'expanded' ? 'constricted' : 'expanded']
	let target = ringThickness[type]
	console.log(origin, target)
	new TWEEN.Tween({ inner: origin.inner, outer: origin.outer }).to({ inner: target.inner, outer: target.outer }, objectTransitionTime)
		.easing(TWEEN.Easing.Back.InOut)
		.onUpdate(function() {
			if (border) {
				let newGeom = new THREE.RingBufferGeometry(this.inner, this.outer, 100)
				border.geometry.dispose()
				border.geometry = newGeom
			}
		})
		.start()
}

export default function Environment() {

	const [active, setActive] = useState(true)
	const banner = useSelector(state => state.content.banner)
	const page = useSelector(state => state.content.page)
	const { sceneRotation, scenePosition, object } = useSelector(state => state.system)

	useEffect(() => {

		windowWidth = window.innerWidth
		windowHeight = window.innerHeight

		const appWrapper = document.querySelector('.' + s.webgl)
		// console.log(appWrapper)
		if (appWrapper.children.length <= 0) appWrapper.appendChild(renderer.domElement)

		camera = new THREE.PerspectiveCamera(fov, windowWidth/ windowHeight, 0.1, 300)
		camera2 = new THREE.PerspectiveCamera(fov, windowWidth/ windowHeight, 0.1, 300)
		camera.position.set(0,15, 20)
		camera.lookAt(lookAt[0], lookAt[1], lookAt[2])
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
		if (object === currentObject) {
			console.log('the same, do nothing')
		} else if (object === 'none') {
			console.log('going from something to nothing')
			clearObject()
		} else if (currentObject === 'none') {
			console.log('going from nothing to something')
			formObject()
		} else {
			console.log('switch objects')
			switchObject()
		}
	}, [object])

	useEffect(() => {
		stage.rotation.y = sceneRotation.y
		stage.rotation.x = sceneRotation.x
		// let movementTween
		// function handleMouseMove(e) {
		// 	let y = e.clientX / windowWidth
		// 	let x = e.clientY / windowHeight
		// 	// scene.rotation.y = -1 + (y * 2)
		// 	// scene.rotation.x = -0.25 + (x * 0.5)
		// 	if (movementTween) movementTween.stop()
		// 	movementTween = new TWEEN.Tween({ y: scene.rotation.y, x: scene.rotation.x}).to({ y: -1 + (y * 2), x: -0.25 + (x * 0.5)}, 150)
		// 		// .easing(TWEEN.Easing.Elastic.InOut)
		// 		.onUpdate(function() {
		// 			scene.rotation.y = this.y
		// 			scene.rotation.x = this.x
		// 		})
		// 		.start()
		// }
	}, [sceneRotation])

	// useEffect(() => {
	// 	if (cameraPosition.y) {
	// 		// camera.position.y = cameraPosition.y
	// 		new TWEEN.Tween({y: camera.position.y}).to({y: cameraPosition.y}, 1000)
	// 			.easing(TWEEN.Easing.Exponential.InOut)
	// 			.onUpdate(function () {
	// 				camera.position.y = this.y
	// 			})
	// 			.start()
	// 	}
	// }, [cameraPosition])

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

	function formObject() {
		currentObject = object
		console.log('forming object')
		gatherParticles()
		transformRing('constricted')
		setTimeout(() => {
			raiseObject()
		}, objectTransitionTime)
	}

	function switchObject() {
		lowerObject()
		setTimeout(() => {
			currentObject = object
			gatherParticles()
		}, objectTransitionTime)
		setTimeout(() => {
			raiseObject()
		}, objectTransitionTime * 2)
		// gatherAndDisperse()
		// raiseObject()
	}

	function clearObject() {
		currentObject = object
		lowerObject()
		setTimeout(() => {
			disperseParticles()
			transformRing('expanded')
		}, objectTransitionTime)
	}

	function getRandomOutwardPosition(x, y, z) {
		return {
			x: 0,
			y: 0,
			z: 0
		}
	}

	function gatherParticles() {
		let target = maps[currentObject]
		for (let x = 0; x < 1000; x++) {
			let point = target[x]
			let particle = particleGroup.children[x]
			if (!point) {
				// this map does not exceed 1000 particles
				moveParticleToEdge(particle)
			} else {
				moveParticleToCenter(particle, point)
			}
		}
	}

	function disperseParticles() {
		for (let x = 0; x < 1000; x++) {
			let particle = particleGroup.children[x]
			let pos = particle.position
			if (Math.abs(pos.x) < 3) {
				moveParticleToEdge(particle)
			}
		}
	}

	function raiseObject() {
		let target = maps[object]
		for (let x = 0; x < 1000; x++) {
			let point = target[x]
			if (!point) {

			} else {
				let particle = particleGroup.children[x]
				moveParticleUp(particle, point)
			}
		}
	}

	function lowerObject() {
		for (let x = 0; x < 1000; x++) {
			let particle = particleGroup.children[x]
			let pos = particle.position
			if (Math.abs(pos.x)  < 3) {
				moveParticleDown(particle)
			}
		}
	}

	function moveParticleToCenter(particle, point) {
		let pos = particle.position
		new TWEEN.Tween({x: pos.x, z: pos.z}).to({x: point[0], z: point[2]}, objectTransitionTime)
			.easing(TWEEN.Easing.Exponential.InOut)
			.onUpdate(function () {
				particle.position.set(this.x, pos.y, this.z)
			})
			.start()
	}

	function moveParticleToEdge(particle) {
		let pos = particle.position
		let theta = Math.random() * Math.PI * 2
		let x = (Math.random() * 1 + 6) * Math.cos(theta) + Math.sin(theta)
		let z = (Math.random() * 1 + 6)  * Math.sin(theta) - Math.cos(theta)
		new TWEEN.Tween({x: pos.x, z: pos.z}).to({x: x, z: z}, objectTransitionTime)
			.easing(TWEEN.Easing.Exponential.InOut)
			.onUpdate(function () {
				particle.position.set(this.x, pos.y, this.z)
			})
			.start()
	}

	function moveParticleUp(particle, point) {
		let pos = particle.position
		new TWEEN.Tween({y: pos.y}).to({y: point[1]}, objectTransitionTime)
			.easing(TWEEN.Easing.Exponential.InOut)
			.onUpdate(function () {
				particle.position.setY(this.y)
			})
			.start()
	}

	function moveParticleDown(particle) {
		let pos = particle.position
		new TWEEN.Tween({y: pos.y}).to({y: Math.random() - 1.3}, objectTransitionTime)
			.easing(TWEEN.Easing.Elastic.Out)
			.onUpdate(function () {
				particle.position.setY(this.y)
			})
			.start()
	}






	function scatterParticles() {
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
		stage.add(spinningParticles)

		for (let x = 0; x < 100; x++) {
			let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 1 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 1 + 6)  * Math.sin(theta) - Math.cos(theta)
			particle.position.set(x, -0.1 - Math.random(),  z)
			// particle.position.set(3 + Math.random() * 2, -1 + Math.random() * 3, 2 + Math.random() * 2)
			spinningDormant.add(particle)
		}
		stage.add(spinningDormant)
	}

	async function populate() {
		addGuides()
		addSpinning()
		addObjectParticles()

		let planeGeom = new THREE.PlaneBufferGeometry(1000, 1000)
		let planeMat = new THREE.MeshPhysicalMaterial({
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0.8
		})
		let plane = new THREE.Mesh(planeGeom, planeMat)
		plane.rotation.set(-Math.PI / 2, 0, 0)
		plane.receiveShadow = enableShadows
		stage.add(plane)

		// let shadeGeom = new THREE.PlaneBufferGeometry(400, 400)
		// let shadeMat = new THREE.MeshBasicMaterial({
		// 	color: 0x333333,
		// 	transparent: true,
		// 	opacity: 0.05
		// })
		// let shade = new THREE.Mesh(shadeGeom, shadeMat)
		// shade.rotation.set(-Math.PI / 2, 0, Math.PI / 4)
		// shade.position.set(-141.3, 0.01, -141.3)
		// shade.renderOrder = 1
		// stage.add(shade)

		let borderGeom = new THREE.RingBufferGeometry(ringThickness.expanded.inner, ringThickness.expanded.outer, 100)
		let borderMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		border = new THREE.Mesh(borderGeom, borderMat)
		border.position.set(0, 0.1, 0)
		border.rotation.set(-Math.PI / 2, 0, 0)
		stage.add(border)

		// let circleGeom = new THREE.CircleBufferGeometry(10, 30)
		// let circleMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		// let circle = new THREE.Mesh(circleGeom, circleMat)
		// circle.rotation.set(-Math.PI / 2, 0, 0)
		// circle.position.set(0, 0.01, 0)
		// stage.add(circle)

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
		// 	stage.add(object)
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

		scene.add(stage)

		// loadFromJson()
	}

	function addObjectParticles() {
		let particleGeom = new THREE.SphereBufferGeometry(0.05, 16, 8)
		let particleMat = new THREE.MeshToonMaterial({ color: 0x333333 })
		for (let x = 0; x < 1000; x++) {
			let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 0.5 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 0.5 + 6)  * Math.sin(theta) - Math.cos(theta)
			particle.position.set(x, -0.1 - Math.random() * 2,  z)
			particle.castShadow = enableShadows
			particleGroup.add(particle)
		}
		stage.add(particleGroup)
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

		stage.add(particleGroup)
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
		stage.add(bannerGroup)
	}

	function addGuides() {
		let planeGeometry = new THREE.PlaneBufferGeometry(0.05, 100)
		let redMaterial = new THREE.MeshBasicMaterial({ color: 0xde1111, side: THREE.DoubleSide, depthTest: false })
		let blueMaterial = new THREE.MeshBasicMaterial({ color: 0x158def, side: THREE.DoubleSide, depthTest: false })
		let greenMaterial = new THREE.MeshBasicMaterial({ color: 0x4ad53a, side: THREE.DoubleSide, depthTest: false })
		let lineZ = new THREE.Mesh(planeGeometry, redMaterial)
		lineZ.rotation.set(Math.PI / 2, 0 ,0)
		scene.add(lineZ)
		let lineY = new THREE.Mesh(planeGeometry, greenMaterial)
		lineY.rotation.set(0, 0 ,0)
		scene.add(lineY)
		let lineX = new THREE.Mesh(planeGeometry, blueMaterial)
		lineX.rotation.set(0, 0,Math.PI / 2)
		scene.add(lineX)
	}



	let dLight
	function light() {
		let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8)
		stage.add(ambientLight)

		dLight = new THREE.DirectionalLight(0xFFFFFF, 1)
		dLight.position.set(camera.position.x, 10, 2)
		dLight.castShadow = enableShadows
		stage.add(dLight)
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

	return (
		<>
			<div className={cx(s.webgl, { [s.left]: scenePosition === 'left', [s.right]: scenePosition === 'right' })} />
		</>
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
