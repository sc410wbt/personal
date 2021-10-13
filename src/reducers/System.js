const defaultState = {
	sceneRotation: { x: 0, y: 0 },
	scenePosition: 'center',
	object: 'none'
}

const SystemReducer = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_SCENE_ROTATION':
			return {
				...state,
				sceneRotation: action.rotation
			}
		case 'SET_SCENE_POSITION':
			return {
				...state,
				scenePosition: action.position
			}
		case 'SET_OBJECT':
			return {
				...state,
				object: action.object
			}
		default:
			return state
	}
}

export default SystemReducer
