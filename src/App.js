import './App.css'

import {BrowserRouter} from "react-router-dom"

import Header from "./components/Header"
import Nav from './components/Nav'
import Environment from "./Environment"
import Pages from "./Pages"

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Header />
                <Nav />
                <Environment />
                {/*<Pages />*/}
            </BrowserRouter>
        </div>
    )
}

export default App
