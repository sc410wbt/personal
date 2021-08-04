import React, {useEffect} from 'react'
import * as THREE from 'three'
import * as TWEEN from 'tween'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader"
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

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
		renderer.setClearColor(0xFFFFFF, 1)
		renderer.setPixelRatio(1.5) //window.devicePixelRatio)
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
		let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x888888 })
		let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		scene.add(cube)

		let mtlFile = '/models/cartier_room.mtl'
		let mtlLoader = new MTLLoader()
		let materials = await mtlLoader.loadAsync(mtlFile)
		console.log('materials', materials)


		let loader = new OBJLoader()
		loader.setMaterials(materials)

		let model = 'models/cartier_room.obj'
		loader.load(model, (object) => {
			object.scale.set(0.01,0.01,0.01)
			object.position.set(0, -20, 0)
			object.rotation.y = Math.PI / 12
			console.log('loaded', object.children)
			scene.add(object)
		}, () => {
			console.log('error')
		})

		// let loader = new GLTFLoader()
		//
		// loader.load(
		// 	'models/gears/scene.gltf',
		// 	(object) => {
		// 		// let scale = 0.7;
		// 		// object.scene.position.set(11, 0.2, 23);
		// 		// object.scene.scale.set(gearScale, gearScale, gearScale);
		// 		// object.scene.traverse( function( child ) {
		// 		// 	if ( child.isMesh ) {
		// 		// 		child.castShadow = true;
		// 		// 		child.receiveShadow = true;
		// 		// 		child.material.metalness = 0.5;
		// 		// 		// child.material.roughness = 0.5;
		// 		// 	}
		// 		// } );
		// 		// object.scene.rotation.set(0, Math.PI / 3, 0);
		// 		// scene.add(object.scene)
		// 	}
		// )
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
		scene.rotation.y += 0.001

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
