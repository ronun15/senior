import React, { Component } from 'react'
import './App.css'

import MainView from './components/mainView'

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            env: 'dev',
            main: {
                height: document.documentElement.clientHeight,
                width: 0.8 * document.documentElement.clientWidth
            }
        }
    }

    render() {
        return <MainView height={this.state.main.height} width={this.state.main.width} />
    }
}

export default App
