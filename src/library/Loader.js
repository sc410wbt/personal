import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

export default async function formulateSprites(url, options = {}) {

	let loader = new GLTFLoader()
	let object = await loader.loadAsync(url)

	// object.scene.position.set(11, 0.2, 23)
	let meshGroup = new THREE.Group()
	object.scene.traverse(function (child) {
		if (child.isMesh) {
			// console.log('child', child.geometry)
			child.castShadow = true
			child.receiveShadow = true
			child.material.metalness = 0.5
			// child.material.roughness = 0.5
			// console.log('scale', options.scale)
			meshGroup.add(placeSprites(child.geometry.attributes.position.array, options))
		}
	})
	// console.log(meshGroup)
	if (options.position) meshGroup.position.set(...options.position)
	if (options.rotation) meshGroup.rotation.set(...options.rotation)
	let total = 0
	let points = []
	meshGroup.children.forEach(group => {
		let target = new THREE.Vector3()
		group.children.forEach(sprite => {
			sprite.getWorldPosition(target)
			// points.push([sprite.position.x, sprite.position.y, sprite.position.z])
			points.push([target.x, target.y, target.z])
		})
		total += group.children.length
	})
	console.log('total sprites formulated', total)
	return points

}

function placeSprites(position, options) {
	// console.log(position)
	// console.log(options)
	let threshhold = options.minDistance = 0.1
	let upperThreshold = options.maxDistance || 0.5
	let multiplier = options.scale || 1
	let group = new THREE.Group()
	group.rotation.set(0, 0, 0)

	let spriteScale = 0.05
	const map = new THREE.TextureLoader().load( '/images/sprite.png' )
	// console.log('sprite map', map)
	const material = new THREE.SpriteMaterial({ map: map })
	const tempMaterial = new THREE.SpriteMaterial({ map: map })


	let lastX
	let lastY
	let lastZ


	// const lineMaterial = new THREE.LineBasicMaterial({
	// 	color: 0x69ffff,
	// 	transparent: true,
	// 	opacity: 0.2
	// })



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
		if (randomScale > 0.1) {
			sprite.scale.set(randomScale, randomScale, randomScale)
			// console.log(sprite)
			group.add(sprite)
		}

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
					// console.log('adding', x, lastX, y, lastY, z, lastZ)
				}





				// const points = []
				// points.push( new THREE.Vector3( x, y, z ) )
				// points.push( new THREE.Vector3( lastX, lastY, lastZ ) )
				//
				// const geometry = new THREE.BufferGeometry().setFromPoints( points )
				//
				// const line = new THREE.Line( geometry, lineMaterial )
				// group.add( line )

			}
		}

		// console.log('sprite placement', x,y,x)
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
	return group
}


function randomizePoints(x, y, z, intensity = 0.1) {
	x = x - intensity + Math.random() * intensity * 2
	y = y - intensity + Math.random() * intensity * 2
	z = z - intensity + Math.random() * intensity * 2
	return [x, y, z]
}
