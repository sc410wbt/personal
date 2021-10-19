import React, {useState, useEffect} from 'react'
import {useSelector} from "react-redux"
import cx from 'classnames'
import * as THREE from 'three'
import {Geometry} from "three/examples/jsm/deprecated/Geometry"
import * as TWEEN from 'tween'
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader"
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer"
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass"
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass"
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass";
import * as _ from 'lodash'

import font from './fonts/Montserrat_Bold.json'

import AndroidMap from './maps/android.json'
import RhinoMap from './maps/rhino.json'
import CameraMap from './maps/camera.json'
import PhoneMap from './maps/phone.json'
import GlobeMap from './maps/globe.json'
import CubeMap from './maps/cube.json'
import RingMap from './maps/ring.json'
import CylinderMap from './maps/cylinder.json'
import FrameMap from './maps/frame.json'
import PillarMap from './maps/pillar.json'

import s from './Environment.module.sass'
import {RingBufferGeometry, SpriteMaterial} from "three";
import {addTitleGroupToStage, addTitle, removeTitle} from "./webgl/Titles"

const maps = {
	rhino: RhinoMap,
	android: AndroidMap,
	camera: CameraMap,
	phone: PhoneMap,
	globe: GlobeMap,
	cube: CubeMap,
	ring: RingMap,
	cylinder: CylinderMap,
	frame: FrameMap,
	pillar: PillarMap
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
let composer
let camera
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

let photoGroup = new THREE.Group()
photoGroup.visible = false
photoGroup.position.set(-20, -10, -20)
export function addPhotos(photos) {

	photos.forEach((src, x) => {

		let frameWidth = 0.1
		let photo = new THREE.Group()
		let frameGeom = new THREE.BoxBufferGeometry(6.2, 4.2, frameWidth)
		let frameMat = new THREE.MeshPhysicalMaterial({color: 0x000000})
		let frame = new THREE.Mesh(frameGeom, frameMat)
		photo.add(frame)
		let imageGeom = new THREE.PlaneBufferGeometry(6, 4)
		let imageMat = new THREE.MeshPhysicalMaterial({
			map: new THREE.TextureLoader().load('/media/projects/ARBooth/android-models.jpg'),
			// side: THREE.DoubleSide
		})
		let image = new THREE.Mesh(imageGeom, imageMat)
		image.position.set(0, 0, frameWidth / 2 + 0.01)
		photo.add(image)

		photo.rotation.set(0, 0, 0)
		photo.position.set(0, 2.1, 0 - x)

		photoGroup.add(photo)
	})

}

export function showGallery() {
	photoGroup.visible = true
	new TWEEN.Tween({y: -10}).to({y: 0.1}, 1000)
		.easing(TWEEN.Easing.Exponential.InOut)
		.onUpdate(function() {
			photoGroup.position.y = this.y
		})
		.start()
}

export function hideGallery() {
	new TWEEN.Tween({y: 0.1}).to({y: -10}, 1000)
		.easing(TWEEN.Easing.Exponential.InOut)
		.onUpdate(function() {
			photoGroup.position.y = this.y
		})
		.onComplete(function() {
			photoGroup.visible = false
		})
		.start()
}


export function setCameraTarget(x, y, z) {
	camera.lookAt(x, y, z)
}

export function setCameraPosition(x, y, z, lx, ly, lz) {
	let pos = camera.position
	let prevLookAt = [...lookAt]
	console.log(lx, ly, lz)
	if (typeof lx === 'undefined') lx = lookAt[0]
	if (typeof ly === 'undefined') ly = lookAt[1]
	if (typeof lz === 'undefined') lz = lookAt[2]
	console.log(prevLookAt, lx, ly, lz)
	new TWEEN.Tween({x: pos.x, y: pos.y, z: pos.z, lx: prevLookAt[0], ly: prevLookAt[1], lz: prevLookAt[2] }).to({x: x, y: y, z: z, lx: lx, ly: ly, lz: lz }, 1000)
		.easing(TWEEN.Easing.Exponential.InOut)
		.onComplete(function() {
			lookAt = [lx, ly, lz]
		})
		.onUpdate(function () {
			camera.position.x = this.x
			camera.position.y = this.y
			camera.position.z = this.z
			camera.lookAt(this.lx, this.ly, this.lz)
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

	const [stageRotating, setStageRotating] = useState(false)
	const [active, setActive] = useState(true)
	const page = useSelector(state => state.content.page)
	const { rotation, rotationObject, scenePosition, object, title, windowDimensions } = useSelector(state => state.system)

	useEffect(() => {

		windowWidth = window.innerWidth
		windowHeight = window.innerHeight

		const appWrapper = document.querySelector('.' + s.webgl)
		// console.log(appWrapper)
		if (appWrapper.children.length <= 0) appWrapper.appendChild(renderer.domElement)
		camera = new THREE.PerspectiveCamera(fov, 1,  0.1, 600)
		camera.position.set(0,15, 20)
		camera.lookAt(lookAt[0], lookAt[1], lookAt[2])
		renderer.setClearColor(0x222222, 0)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap

		composer = new EffectComposer(renderer)
		composer.addPass(new RenderPass(scene, camera))

		let resolution, strength, radius, threshold
		resolution = new THREE.Vector2(1028, 1028)
		strength = 0.29 //0.32
		radius = 0.1
		threshold = 0.2
		let unrealBloomPass = new UnrealBloomPass(resolution, strength, radius, threshold)
		composer.addPass(unrealBloomPass)

		// const filmPass = new FilmPass(
		// 	1,   // noise intensity
		// 	0.2,  // scanline intensity
		// 	// window.innerHeight / 1.5,    // scanline count
		// 	// false,  // grayscale
		// )
		// filmPass.renderToScreen = true
		// composer.addPass(filmPass)

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
		removeTitle()
		if (title) {
			setTimeout(() => {
				addTitle(title)
			}, 500)
		}
	}, [title])

	useEffect(() => {
		renderer.setSize(windowDimensions.width, windowDimensions.height)
		camera.aspect = (windowDimensions.width / windowDimensions.height)
		camera.updateProjectionMatrix()
	}, [windowDimensions])

	useEffect(() => {
		if (rotationObject === 'stage') {
			stage.rotation.y = rotation.y
			stage.rotation.x = rotation.x
		} else {
			if (!stageRotating) {
				setStageRotating(true)
				new TWEEN.Tween({ y: stage.rotation.y, x: stage.rotation.x }).to({ y: 0, x: 0 }, 500)
					.onUpdate(function() {
						stage.rotation.y = this.y
						stage.rotation.x = this.x
					})
					.onComplete(() => setStageRotating(false))
					.start()
			}
			photoGroup.rotation.y = rotation.y
			photoGroup.rotation.x = rotation.x
		}
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
	}, [rotation])

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

	function addSpinning() {
		// let particleGeom = new THREE.SphereBufferGeometry(0.05, 16, 8)
		// let particleMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		for (let x = 0; x < 100; x++) {
			let sprite = new THREE.Sprite(spriteMaterial)
			// let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 0.2 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 0.2 + 6)  * Math.sin(theta) - Math.cos(theta)
			sprite.position.set(x, -0.1 - Math.random(),  z)
			sprite.scale.set(0.1,0.1,0.1)
			// particle.position.set(3 + Math.random() * 2, -1 + Math.random() * 3, 2 + Math.random() * 2)
			spinningParticles.add(sprite)
		}
		stage.add(spinningParticles)

		for (let x = 0; x < 100; x++) {
			let sprite = new THREE.Sprite(spriteMaterial)
			// let particle = new THREE.Mesh(particleGeom, particleMat)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 0.1 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 0.1 + 6)  * Math.sin(theta) - Math.cos(theta)
			sprite.position.set(x, -0.05 - Math.random() * 0.5,  z)
			sprite.scale.set(0.12,0.12,0.12)
			// particle.position.set(3 + Math.random() * 2, -1 + Math.random() * 3, 2 + Math.random() * 2)
			spinningDormant.add(sprite)
		}
		stage.add(spinningDormant)
	}

	async function populate() {
		// addGuides()
		addTitleGroupToStage(stage)
		addSpinning()
		addObjectParticles()

		stage.add(photoGroup)

		let planeGeom = new THREE.PlaneBufferGeometry(100, 100)
		let planeMat = new THREE.MeshPhysicalMaterial({
			color: 0xFFFFFF,
			// transmission: 0.5,
			transparent: true,
			// sides: THREE.DoubleSide,
			opacity: 0.25,
			// specularIntensity: 0.5
		})
		let plane = new THREE.Mesh(planeGeom, planeMat)
		plane.rotation.set(-Math.PI / 2, 0, 0)
		plane.receiveShadow = enableShadows
		stage.add(plane)

		let boxGeom = new THREE.BoxBufferGeometry(100, 100, 100)
		let boxMat = new THREE.MeshBasicMaterial({ color: 0xEEEEEE, side: THREE.DoubleSide })
		let box = new THREE.Mesh(boxGeom, boxMat)
		box.position.set(0, 0, 0)
		stage.add(box)

		// let wallMat = new THREE.MeshBasicMaterial({
		// 	color: 0xFFFFFF,
		// 	sides: THREE.DoubleSide,
		// })
		// let wallGeom = new THREE.PlaneBufferGeometry(1000, 1000)
		// let wall = new THREE.Mesh(wallGeom, wallMat)
		// wall.position.set(0, 0, -10)
		// stage.add(wall)

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

		// addBannerWobble()

		scene.add(stage)

	}

	function addObjectParticles() {
		// let particleGeom = new THREE.SphereBufferGeometry(0.05, 16, 8)
		// let particleMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
		for (let x = 0; x < 1000; x++) {
			// let particle = new THREE.Mesh(particleGeom, particleMat)
			let sprite = new THREE.Sprite(spriteMaterial)
			let theta = Math.random() * Math.PI * 2
			let x = (Math.random() * 0.5 + 6) * Math.cos(theta) + Math.sin(theta)
			let z = (Math.random() * 0.5 + 6)  * Math.sin(theta) - Math.cos(theta)
			sprite.position.set(x, -0.1 - Math.random() * 2,  z)
			sprite.scale.set(0.1,0.1,0.1)
			// particle.castShadow = enableShadows
			particleGroup.add(sprite)
		}
		stage.add(particleGroup)
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
		dLight.position.set(0, 10, 0)
		dLight.castShadow = enableShadows
		stage.add(dLight)
	}

	function animate() {
		frames++
		// scene.rotation.y += 0.005
		spinningParticles.rotation.y += 0.005
		spinningDormant.rotation.y += 0.002

		dLight.position.set(camera.position.x, 10, 2)

		// bannerGroup.rotation.y -= 0.004

		TWEEN.update()
		requestAnimationFrame(animate)

		// renderer.render(scene, camera)
		composer.render()
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
