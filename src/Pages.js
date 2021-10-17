import React, {useEffect} from 'react'
import {Switch, Route, useHistory, withRouter, useLocation} from 'react-router-dom'
import {TransitionGroup, CSSTransition} from "react-transition-group"
import PageTitle from "./components/PageTile"

import ARBoothPage from "./pages/projects/ARBooth"
import InspirationMuseumPage from "./pages/projects/InspirationMuseum"
import ImportPage from "./pages/Import"
import HomePage from "./pages/Home";

export default function Pages() {

	const location = useLocation()

	return (

		<TransitionGroup>
			<CSSTransition timeout={1000} className={'wrapper'} key={location.pathname}>
				<main>

					<Switch location={location}>

						<Route exact path={"/"}>
							<HomePage />
						</Route>
						<Route exact path={"/projects/ar-immersion-booth"}>
							<ARBoothPage />
						</Route>
						<Route exact path={"/projects/inspiration-museum"}>
							<InspirationMuseumPage />
						</Route>
						<Route exact path={"/import"}>
							<ImportPage />
						</Route>

					</Switch>

				</main>
			</CSSTransition>
		</TransitionGroup>

	)

}

