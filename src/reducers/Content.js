const defaultState = {
	banner: 'rhino'
}

const ContentReducer = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_BANNER':
			return {
				...state,
				banner: action.banner
			}
		default:
			return state
	}
}

export default ContentReducer
