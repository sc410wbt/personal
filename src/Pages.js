import React, {useEffect} from 'react'
import {Switch, Route, useHistory, withRouter} from 'react-router-dom'
import PageTitle from "./components/PageTile"

import ImportPage from "./pages/Import"

export default function Pages() {

	return (

		<Switch>

			<main>

				<PageTitle />

				<Route path={"/"}>
					{/*Home Page test*/}
				</Route>
				<Route path={"/import"}>
					<ImportPage />
				</Route>

			</main>

		</Switch>

	)

}
