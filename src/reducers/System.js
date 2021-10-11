const defaultState = {
	sceneRotation: { x: 0, y: 0 }
}

const SystemReducer = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_SCENE_ROTATION':
			return {
				...state,
				sceneRotation: action.rotation
			}
		default:
			return state
	}
}

export default SystemReducer
