const defaultState = {
	rotation: { x: 0, y: 0 },
	rotationObject: 'stage',
	scenePosition: 'center',
	object: 'none',
	deviceOrientation: ''
}

const SystemReducer = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_ROTATION':
			return {
				...state,
				rotation: action.rotation
			}
		case 'SET_ROTATION_OBJECT':
			return {
				...state,
				rotationObject: action.object
			}
		case 'SET_SCENE_POSITION':
			return {
				...state,
				scenePosition: action.position
			}
		case 'SET_TITLE':
			return {
				...state,
				title: action.title
			}
		case 'SET_OBJECT':
			return {
				...state,
				object: action.object
			}
		case 'SET_DEVICE_ORIENTATION':
			return {
				...state,
				deviceOrientation: action.orientation
			}
		default:
			return state
	}
}

export default SystemReducer
