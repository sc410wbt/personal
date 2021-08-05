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
		renderer.setPixelRatio(0.8) //window.devicePixelRatio)
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
		addGuides()
		addStardust()

		// let cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
		// let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, metalness: 1, roughness: 1 })
		//
		// let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		// cube.position.set(0, 0, 0)
		// scene.add(cube)
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
			'/models/rhino/scene.gltf',
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
				// scene.add(object.scene)
			},
			() => {

			},
			(error) => {
				console.log(error)
			}
		)


	}

	function addGuides() {
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xd81921,
			transparent: true,
			opacity: 0.5
		});

		const points = [];
		points.push( new THREE.Vector3( 0, 0, 0 ) );
		points.push( new THREE.Vector3( 0, 0, 20 ) );

		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		const line = new THREE.Line( geometry, new THREE.LineBasicMaterial({
			color: 0xd81921,
			transparent: true,
			opacity: 0.5
		}))
		scene.add( line );

		const pointsY = [];
		pointsY.push( new THREE.Vector3( 0, 0, 0 ) );
		pointsY.push( new THREE.Vector3( 0, 20, 0 ) );

		const geometryY = new THREE.BufferGeometry().setFromPoints( pointsY );

		const lineY = new THREE.Line( geometryY, new THREE.LineBasicMaterial({
			color: 0x6cbd38,
			transparent: true,
			opacity: 0.5
		}) )
		scene.add( lineY );

		lineMaterial.color.set(0x69FFFF)

		const pointsZ = [];
		pointsZ.push( new THREE.Vector3( 0, 0, 0 ) );
		pointsZ.push( new THREE.Vector3( 20, 0, 0 ) );

		const geometryZ = new THREE.BufferGeometry().setFromPoints( pointsZ );

		const lineZ = new THREE.Line( geometryZ, lineMaterial );
		scene.add( lineZ );
	}

	function addStardust() {
		let spriteScale = 0.05
		const map = new THREE.TextureLoader().load( '/images/sprite-blurred.png' )
		const material = new THREE.SpriteMaterial({ map: map })

		let max = 20

		for (let x = 0; x <= 300; x++) {
			const sprite = new THREE.Sprite(material)
			sprite.position.set(0 - max + Math.random() * max * 2, 0 - max + Math.random() * max * 2, 0 - max + Math.random() * max * 2)
			let randomScale = spriteScale + Math.random() * 0.25
			sprite.scale.set(randomScale, randomScale, randomScale)
			scene.add(sprite)
		}
	}

	async function placeSprites(position) {
		console.log(position)
		let threshhold = 0.1
		let upperThreshold = 1.5
		let multiplier = 3
		let group = new THREE.Group()
		group.rotation.set(0 - Math.PI / 2, 0, 0)

		let spriteScale = 0.05
		const map = await new THREE.TextureLoader().load( '/images/sprite.png' )
		console.log('sprite map', map)
		const material = new THREE.SpriteMaterial({ map: map })
		const tempMaterial = new THREE.SpriteMaterial({ map: map })


		let lastX
		let lastY
		let lastZ


		// const lineMaterial = new THREE.LineBasicMaterial({
		// 	color: 0x69ffff,
		// 	transparent: true,
		// 	opacity: 0.2
		// });



		for (let i = 0; i < position.length; i += 6) {
			let x = position[i] * multiplier
			let y = position[i + 1] * multiplier
			let z = position[i + 2] * multiplier

			// Space them out
			if (lastX) {
				// console.log('compare', lastX, x)
				if (Math.abs(x - lastX) < threshhold * multiplier &&
					Math.abs(y - lastY) < threshhold * multiplier &&
					Math.abs(z - lastZ) < threshhold * multiplier) {
					// not enough distance, skip
					continue
				}
			}




			const sprite = new THREE.Sprite(material)
			let [rX, rY, rZ] = randomizePoints(x, y, z)
			sprite.position.set(rX, rY, rZ)
			let randomScale = spriteScale + Math.random() * 0.1
			sprite.scale.set(randomScale, randomScale, randomScale)
			// console.log(sprite)
			group.add(sprite)

			if (lastX) {
				// Keep this if statement in, might be more efficient before getting to distance calc
				if (Math.abs(x - lastX) > upperThreshold * multiplier ||
					Math.abs(y - lastY) > upperThreshold * multiplier ||
					Math.abs(z - lastZ) > upperThreshold * multiplier) {
					// too far, add stuff in between

					let distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2) + Math.pow(z - lastZ, 2))
					let iterations = Math.ceil(distance)

					for (let i = 1; i < iterations; i++) {
						let newX = lastX + ((x - lastX) / iterations) * i
						let newY = lastY + ((y - lastY) / iterations) * i
						let newZ = lastZ + ((z - lastZ) / iterations) * i
						const sprite = new THREE.Sprite(tempMaterial)
						let [rnX, rnY, rnZ] = randomizePoints(newX, newY, newZ, 0.5)
						sprite.position.set(rnX, rnY, rnZ)
						// sprite.position.set(x + 0.1, y + 0.1, z + 0.1)
						let randomScale = spriteScale + Math.random() * 0.2
						sprite.scale.set(randomScale, randomScale, randomScale)
						group.add(sprite)
						console.log('adding', x, lastX, y, lastY, z, lastZ)
					}





					// const points = [];
					// points.push( new THREE.Vector3( x, y, z ) );
					// points.push( new THREE.Vector3( lastX, lastY, lastZ ) );
					//
					// const geometry = new THREE.BufferGeometry().setFromPoints( points );
					//
					// const line = new THREE.Line( geometry, lineMaterial );
					// group.add( line );

				}
			}

			console.log('sprite placement', x,y,x)
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
		scene.add(group)
	}

	function randomizePoints(x, y, z, intensity = 0.1) {
		x = x - intensity + Math.random() * intensity * 2
		y = y - intensity + Math.random() * intensity * 2
		z = z - intensity + Math.random() * intensity * 2
		return [x, y, z]
	}

	function light() {
		// let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
		// scene.add(ambientLight)
		//
		// let dLight = new THREE.DirectionalLight(0xFFFFFF, 0.5)
		// dLight.position.set(3, 2, 3)
		// scene.add(dLight)
	}

	function animate() {
		frames++
		scene.rotation.y += 0.005

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
