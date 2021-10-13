const defaultState = {
	sceneRotation: { x: 0, y: 0 },
	scenePosition: 'center'
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
		default:
			return state
	}
}

export default SystemReducer
