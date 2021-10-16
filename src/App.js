import * as _ from 'lodash'
import {BrowserRouter} from "react-router-dom"
import {useDispatch} from "react-redux"

import DevPane from "./components/DevPane"
import Header from "./components/Header"
import Nav from './components/Nav'
import Environment from "./Environment"
import Pages from "./Pages"
import SectionNav from "./components/SectionNav"

import './App.sass'
import ProgressBar from "./components/ProgressBar"
import Landing from "./components/Landing";

function App() {

    let windowWidth = window.innerWidth
    let windowHeight = window.innerHeight

    const dispatch = useDispatch()

    function handleMouseMove(e) {
        let y = e.clientX / windowWidth
        let x = e.clientY / windowHeight
        let sceneRotation = {
            y: -0.5 + y,
            x: -0.2 + (x * 0.2)
        }
        dispatch({ type: 'SET_SCENE_ROTATION', rotation: sceneRotation })
    }

    return (
        <div className="App" onMouseMove={_.throttle(handleMouseMove, 10)}>
            <BrowserRouter>
                <Landing />
                <DevPane />
                <Header />
                {/*<Nav />*/}
                <Environment />
                <Pages />
                {/*<ProgressBar />*/}
                {/*<SectionNav />*/}
            </BrowserRouter>
        </div>
    )
}

export default App
