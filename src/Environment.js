import React, {useEffect} from 'react'
import * as THREE from 'three'
import * as TWEEN from 'tween'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader"
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import spriteImg from './images/sprite.png'

import s from './Environment.module.sass'

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer( { antialias: true })
let camera
let controls
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let pauseAnimation = false
let clickable = []
let lights = {}
let videos = []
let categoryVideo
let roomSelected = false

let dragTimer
let azimuthalAngle // side to side
let polarAngle // up, down
let dragging = false

let frames = 0
let frameTimer

let fov = (window.innerWidth < 760) ? 60 : 45
let cameraZ = 10

export default function Environment() {

	useEffect(() => {

		const appWrapper = document.querySelector('.' + s.webgl)
		console.log(appWrapper)
		if (appWrapper.children.length <= 0) appWrapper.appendChild(renderer.domElement)

		camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, 0.1, 300)
		camera.position.set(0,0, cameraZ)
		renderer.setClearColor(0x333333, 1)
		renderer.setPixelRatio(1) //window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap

		controls = new OrbitControls(camera, renderer.domElement)
		controls.enableZoom = true
		controls.enableDamping = true
		controls.dampingFactor = 0.12
		// controls.rotateSpeed *= 0.4

		populate()
		light()
		animate()

	}, [])



	async function populate() {
		let cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
		let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, metalness: 1, roughness: 1 })

		let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		cube.position.set(0, 0, 0)
		scene.add(cube)
		// console.log(cubeGeometry.attributes.position)

		let mtlFile = '/models/cartier_room.mtl'
		let mtlLoader = new MTLLoader()
		let materials = await mtlLoader.loadAsync(mtlFile)
		console.log('materials', materials)


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




		let loader = new GLTFLoader()

		loader.load(
			'/models/android/scene.gltf',
			(object) => {
				console.log('success')
				let scale = 1;
				// object.scene.position.set(11, 0.2, 23);
				object.scene.scale.set(scale, scale, scale);
				object.scene.traverse( function( child ) {
					if ( child.isMesh ) {
						console.log('child', child.geometry)
						child.castShadow = true;
						child.receiveShadow = true;
						child.material.metalness = 0.5;
						// child.material.roughness = 0.5;
						placeSprites(child.geometry.attributes.position.array)
					}
				} );
				object.scene.rotation.set(0, Math.PI / 3, 0);
				object.scene.position.set(10, 0, 0)
				scene.add(object.scene)
			},
			() => {

			},
			(error) => {
				console.log(error)
			}
		)
	}

	async function placeSprites(position) {
		console.log(position)
		let threshhold = 0.15
		let upperThreshold = 0.5
		let multiplier = 3
		let group = new THREE.Group()
		group.rotation.set(0 - Math.PI / 2, 0, 0)

		let spriteScale = 0.1
		const map = await new THREE.TextureLoader().load( '/images/sprite.png' )
		// console.log('sprite map', map)
		const material = new THREE.SpriteMaterial({ map: map })

		let lastX
		let lastY
		let lastZ

		for (let i = 0; i < position.length; i += 3) {
			let x = position[i] * multiplier
			let y = position[i + 1] * multiplier
			let z = position[i + 2] * multiplier

			// Space them out
			if (lastX) {
				// console.log('compare', lastX, x)
				if (Math.abs(Math.abs(x) - Math.abs(lastX)) < threshhold * multiplier &&
					Math.abs(Math.abs(y) - Math.abs(lastY)) < threshhold * multiplier &&
					Math.abs(Math.abs(z) - Math.abs(lastZ)) < threshhold * multiplier) {
					// not enough distance, skip
					continue
				}
			}




			const sprite = new THREE.Sprite(material)
			let [rX, rY, rZ] = randomizePoints(x, y, z)
			sprite.position.set(rX, rY, rZ)
			sprite.scale.set(spriteScale, spriteScale, spriteScale)
			console.log(sprite)
			group.add(sprite);

			if (lastX) {
				if (Math.abs(x - lastX) > upperThreshold * multiplier ||
					Math.abs(y - lastY) > upperThreshold * multiplier ||
					Math.abs(z - lastZ) > upperThreshold * multiplier) {
					// not enough distance, skip



					let newX = (x - (x - lastX / 2))
					let newY = (y - (y - lastY / 2))
					let newZ = (z - (z - lastZ / 2))
					const sprite = new THREE.Sprite(material)
					let [rnX, rnY, rnZ] = randomizePoints(newX, newY, newZ, 0)
					sprite.position.set(rnX, rnY, rnZ)
					sprite.scale.set(spriteScale, spriteScale, spriteScale)
					group.add(sprite)
					console.log('adding')
				}
			}

			scene.add(group)
			console.log(group.children)


			lastX = x
			lastY = y
			lastZ = z

			// let cubeGeometry = new THREE.BoxBufferGeometry(0.05, 0.05, 0.05)
			// let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x888888 })
			//
			// let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
			// cube.position.set(x, y, z)
			// scene.add(cube)
		}
	}

	function randomizePoints(x, y, z, intensity = 0.1) {
		// if (!intensity._emval_is_number) intensity = 0.1
		x = x - intensity + Math.random() * intensity * 2
		y = y - intensity + Math.random() * intensity * 2
		z = z - intensity + Math.random() * intensity * 2
		return [x, y, z]
	}

	function light() {
		let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
		scene.add(ambientLight)

		let dLight = new THREE.DirectionalLight(0xFFFFFF, 0.5)
		dLight.position.set(3, 2, 3)
		scene.add(dLight)
	}

	function animate() {
		frames++
		// scene.rotation.y += 0.001

		TWEEN.update()
		renderer.render(scene, camera)
		requestAnimationFrame(animate)
	}

	return (
		<div>
			<div className={s.webgl} />
		</div>
	)

}
