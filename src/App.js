import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

import MainView from './components/mainView'
import PlanView from './components/planView'
import DevTab from './components/devTab'
import TopTab from './components/topTab'
import RightTab from './components/rightTab'

const MainDiv = styled.div`
    display: flex;
    flex-direction: row;
`

const CanvasDiv = styled.div`
    position: relative;
    overflow: hidden;
    width: 80%;
    height: 100%;
`

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            env: 'dev',
            loading: true,
            mainState: {
                height: document.documentElement.clientHeight,
                width: 0.8 * document.documentElement.clientWidth
            },
            planState: {
                show: false,
                height: 0,
                width: 0.8 * document.documentElement.clientWidth
            },
            graph: {},
            box: {},
            startingPoint: '360.jpg',
            websiteLink: 'https://en.wikipedia.org/wiki/Cat',
            controls: {
                addingPoint: false,
                deletePoint: false,
                addingBox: false,
                moving: false
            },
            stickerList: []
        }

        this.getData = this.getData.bind(this)
        this.resizeWindow = this.resizeWindow.bind(this)
        this.addBox = this.addBox.bind(this)
        this.showPlan = this.showPlan.bind(this)
    }

    async componentDidMount() {
        const data = await this.getData()
        await this.setState({ graph: data.graph, box: data.box })
        window.addEventListener('resize', this.resizeWindow)
        this.setState({ loading: false })
    }

    getData() {
        return {
            graph: {
                '360.jpg': {
                    pos: new THREE.Vector3(1.38, 2, -0.84),
                    floor: 1,
                    edge: [],
                    sticker: [],
                    boxName: '1'
                },
                '3602.png': {
                    pos: new THREE.Vector3(3.5, 2, 0.5),
                    floor: 1,
                    edge: [],
                    sticker: [],
                    boxName: '2'
                },
                '3603.png': {
                    pos: new THREE.Vector3(3.5, 4, 0.5),
                    floor: 2,
                    edge: [],
                    sticker: [],
                    boxName: '3'
                },
                '3604.png': {
                    pos: new THREE.Vector3(0.5, 0, 0.5),
                    floor: 0,
                    edge: [],
                    sticker: [],
                    boxName: '4'
                }
            },
            box: {}
        }
    }

    resizeWindow() {
        const mainStateCopy = Object.assign({}, this.state.mainState)
        mainStateCopy.width = 0.8 * document.documentElement.clientWidth

        const planStateCopy = Object.assign({}, this.state.planState)
        planStateCopy.width = 0.8 * document.documentElement.clientWidth

        if (this.state.controls.addingBox || this.state.controls.moving) {
            mainStateCopy.height = 0
            planStateCopy.height = document.documentElement.clientHeight
        } else if (this.state.planState.show) {
            mainStateCopy.height = 0.8 * document.documentElement.clientHeight
            planStateCopy.height = 0.2 * document.documentElement.clientHeight
        } else {
            mainStateCopy.height = document.documentElement.clientHeight
            planStateCopy.height = 0
        }

        this.setState({ mainState: mainStateCopy, planState: planStateCopy })
    }

    addBox() {
        const controlsCopy = Object.assign({}, this.state.controls)
        if (this.state.controls.addingBox === false) {
            controlsCopy.addingBox = true
        } else {
            controlsCopy.addingBox = false
        }
        this.setState({ controls: controlsCopy }, () => {
            this.resizeWindow()
        })

        // if (!beginAddingBox) {
        //     beginAddingBox = true

        //     document.getElementById('info').disabled = true
        //     document.getElementById('gmap').disabled = true
        //     document.getElementById('planButton').disabled = true

        //     for (floor in box) {
        //         for (room in box[floor]) {
        //             box[floor][room]['cubeObject'].visible = false
        //         }
        //     }
        // } else {
        //     beginAddingBox = false

        //     document.getElementById('info').disabled = false
        //     document.getElementById('gmap').disabled = false
        //     document.getElementById('planButton').disabled = false

        //     let name =
        //         document.getElementById('boxName').value !== ''
        //             ? document.getElementById('boxName').value
        //             : ''

        //     for (let obj of planScene.children) {
        //         if (obj.name === name || obj.name === '') {
        //             planScene.remove(obj)
        //         }
        //     }
        // }
    }

    showPlan() {
        const planStateCopy = Object.assign({}, this.state.planState)
        planStateCopy.show = !this.state.planState.show
        this.setState({ planState: planStateCopy }, () => {
            this.resizeWindow()
        })
    }

    render() {
        if (!this.state.loading) {
            return (
                <MainDiv controls={this.state.controls}>
                    <CanvasDiv>
                        <MainView
                            mainState={this.state.mainState}
                            graph={this.state.graph}
                            box={this.state.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                        />
                        <PlanView
                            planState={this.state.planState}
                            graph={this.state.graph}
                            box={this.state.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                        />
                        <TopTab
                            showPlan={this.showPlan}
                            websiteLink={this.state.websiteLink}
                        />
                        <RightTab />
                    </CanvasDiv>
                    {this.state.env === 'dev' && (
                        <DevTab
                            controls={this.state.controls}
                            addBox={this.addBox}
                        />
                    )}
                </MainDiv>
            )
        } else {
            return <div />
        }
    }
}

export default App
