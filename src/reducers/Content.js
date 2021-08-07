const defaultState = {
	banner: 'rhino',
	page: '/'
}

const ContentReducer = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_BANNER':
			return {
				...state,
				banner: action.banner
			}
		case 'SET_PAGE':
			return {
				...state,
				page: action.page
			}
		default:
			return state
	}
}

export default ContentReducer
