import React, {useEffect} from 'react'
import * as THREE from 'three'
import * as TWEEN from 'tween'
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



	function populate() {
		let cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
		let cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x888888 })
		let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		scene.add(cube)
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
