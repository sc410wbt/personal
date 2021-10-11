import './App.sass'

import {BrowserRouter} from "react-router-dom"

import Header from "./components/Header"
import Nav from './components/Nav'
import Environment from "./Environment"
import Pages from "./Pages"
import SectionNav from "./components/SectionNav";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Header />
                <Nav />
                <Environment />
                <Pages />
                <SectionNav />
            </BrowserRouter>
        </div>
    )
}

export default App
