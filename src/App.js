import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'
import fs from 'fs'

import OrbitControls from './lib/orbitControls'

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
            name: 'test',
            stateDirectory: 'state/',
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
            currentSphere: null,
            controls: {
                addingPoint: false,
                deletePoint: false,
                addingBox: false,
                moving: false
            },
            stickerList: [],
            startingPoint: null,
            websiteLink: 'https://en.wikipedia.org/wiki/Cat'
        }
    }

    componentDidMount = async () => {
        const data = await this.getData()
        this.setState({ graph: data.graph, box: data.box })
        const mainScene = new THREE.Scene()
        const mainCamera = new THREE.PerspectiveCamera(
            75,
            this.state.mainState.width / this.state.mainState.height,
            0.1,
            1000
        )
        const mainRenderer = new THREE.WebGLRenderer()
        const mainControls = new OrbitControls(
            mainCamera,
            mainRenderer.domElement
        )
        const mainMouse = new THREE.Vector2()

        const planScene = new THREE.Scene()
        const planCamera = new THREE.PerspectiveCamera(
            75,
            this.state.planState.width / this.state.planState.height,
            0.1,
            1000
        )
        const planRenderer = new THREE.WebGLRenderer()
        const planControls = new OrbitControls(
            planCamera,
            planRenderer.domElement
        )
        const planMouse = new THREE.Vector2()

        const raycaster = new THREE.Raycaster()

        this.mainScene = mainScene
        this.mainCamera = mainCamera
        this.mainRenderer = mainRenderer
        this.mainControls = mainControls
        this.mainMouse = mainMouse
        this.planScene = planScene
        this.planCamera = planCamera
        this.planRenderer = planRenderer
        this.planControls = planControls
        this.planMouse = planMouse
        this.raycaster = raycaster
        this.hold = false
        this.click = 0
        this.focusedObject = null

        window.addEventListener('resize', this.resizeWindow)
        window.addEventListener('mousemove', this.onMouseMove)
        this.start()
        await this.setState({
            loading: false
        })
    }

    componentWillUnmount = () => {
        this.stop()
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    animate = () => {
        console.log('animate')
        if (this.state.controls.moving && this.hold) {
            console.log(`setboxpos`)
            this.setBoxPosition()
        }
        this.changeBoxVisibility()
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    saveState = () => {
        const data = {
            env: this.state.env,
            name: this.state.name,
            stateDirectory: this.state.stateDirectory,
            graph: this.state.graph,
            box: this.state.box,
            startingPoint: this.state.startingPoint,
            stickerList: this.state.stickerList,
            websiteLink: this.state.websiteLink
        }

        const output = JSON.stringify(data)
        if (!fs.existsSync(this.state.stateDirectory)) {
            fs.mkdirSync(this.state.stateDirectory)
        }
        fs.writeFile(
            `${this.state.stateDirectory}${this.state.name}.json`,
            output,
            err => {
                if (err) throw err
            }
        )
    }

    getData = async () => {
        // return {
        //     graph: {
        //         '360': {
        //             pos: new THREE.Vector3(1.38, 2, -0.84),
        //             floor: 1,
        //             edge: [],
        //             sticker: [],
        //             boxName: '360',
        //             path: './360.jpg'
        //         },
        //         '3602': {
        //             pos: new THREE.Vector3(3.5, 2, 0.5),
        //             floor: 1,
        //             edge: [],
        //             sticker: [],
        //             boxName: '3602',
        //             path: './3602.png'
        //         },
        //         '3603': {
        //             pos: new THREE.Vector3(3.5, 4, 0.5),
        //             floor: 2,
        //             edge: [],
        //             sticker: [],
        //             boxName: '3603',
        //             path: './3603.png'
        //         },
        //         '3604': {
        //             pos: new THREE.Vector3(0.5, 0, 0.5),
        //             floor: 0,
        //             edge: [],
        //             sticker: [],
        //             boxName: '3604',
        //             path: './3604.png'
        //         }
        //     },
        //     box: {},
        //     startingPoint: '360'
        // }
        return { graph: {}, box: {} }
    }

    resizeWindow = () => {
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

    onMouseMove = event => {
        this.mainMouse.x =
            (event.clientX / document.getElementById('canvas').clientWidth) *
                2 -
            1
        this.mainMouse.y =
            -(event.clientY / document.getElementById('canvas').clientHeight) *
                2 +
            1
        this.planMouse.x =
            (event.clientX / document.getElementById('plan').clientWidth) * 2 -
            1
        this.planMouse.y =
            ((document.body.clientHeight - event.clientY) /
                document.getElementById('plan').clientHeight) *
                2 -
            1
    }

    onCanvasMouseDown = () => {
        if (this.state.currentSphere) {
            this.raycastCanvas()
        }
    }

    onCanvasDoubleClick = () => {
        if (this.state.currentSphere) {
            this.addSticker()
        }
    }

    onPlanMouseDown = () => {
        if (!this.hold) {
            if (!this.state.controls.moving) {
                this.raycastPlan(false)
            } else {
                this.click++
                setTimeout(() => {
                    if (this.click > 1) {
                        this.hold = true
                        this.planControls.enabled = false
                    }
                    this.click = 0
                }, 500)
            }
        }
    }

    onPlanMouseUp = () => {
        this.hold = false
        this.planControls.enabled = true
        this.focusedObject = null
    }

    onPlanDoubleClick = () => {
        if (!this.state.controls.moving && !this.state.controls.addingBox) {
            this.raycastPlan(true)
        }
    }

    raycastCanvas = () => {
        const graphCopy = Object.assign({}, this.state.graph)
        const boxCopy = Object.assign({}, this.state.box)
        const controlsCopy = Object.assign({}, this.state.controls)

        this.raycaster.setFromCamera(this.mainMouse, this.mainCamera)
        const intersects = this.raycaster.intersectObjects(
            this.mainScene.children
        )
        if (intersects.length > 0 && intersects[0].object.name === 'arrow') {
            if (this.state.controls.deletePoint) {
                this.mainScene.remove(intersects[0].object)
                const path = intersects[0].object.delPath.path
                const pos = boxCopy[intersects[0].object.floor][
                    intersects[0].object.delPath.box
                ].point.indexOf(path)
                boxCopy[intersects[0].object.floor][
                    intersects[0].object.delPath.box
                ].point.splice(pos, 1)
                for (const name in graphCopy) {
                    for (const edge of graphCopy[name].edge) {
                        if (edge.delPath.path === path) {
                            const pos = graphCopy[name]['edge'].indexOf(edge)
                            graphCopy[name]['edge'].splice(pos, 1)
                        }
                    }
                }
                controlsCopy.deletePoint = false
            } else {
                intersects[0].object.onClickFunction()
            }
        }
        this.setState({
            graph: graphCopy,
            box: boxCopy,
            controls: controlsCopy
        })
    }

    raycastPlan = doubleClick => {
        const graphCopy = Object.assign({}, this.state.graph)
        const boxCopy = Object.assign({}, this.state.box)
        const controlsCopy = Object.assign({}, this.state.controls)

        this.raycaster.setFromCamera(this.planMouse, this.planCamera)
        const intersects = this.raycaster.intersectObjects(
            this.planScene.children
        )
        if (intersects.length > 0) {
            const pathName = document.getElementById('path').value
            const name = pathName.split('/').pop()

            if (
                this.state.currentSphere &&
                !doubleClick &&
                this.state.controls.addingPoint &&
                name !== this.state.currentSphere.name
            ) {
                const pos = this.state.graph[this.state.currentSphere.name].pos
                const xDif = intersects[0].point.x - pos.x
                const yDif = intersects[0].point.z - pos.z
                const rad = Math.atan2(yDif, xDif) + Math.PI

                const geometry = new THREE.PlaneGeometry(5, 5, 32)
                const texture = new THREE.TextureLoader().load('arrow.png')
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide
                })

                const arrow = new THREE.Mesh(geometry, material)
                arrow.rotateX(Math.PI / 2)
                arrow.rotateZ(
                    Math.PI / 2 + rad + intersects[0].object.rotation.y
                )
                arrow.position.set(
                    50 *
                        Math.cos(
                            rad - Math.PI / 2 + intersects[0].object.rotation.y
                        ),
                    -50,
                    50 *
                        Math.sin(
                            rad - Math.PI / 2 + intersects[0].object.rotation.y
                        )
                )
                arrow.scale.set(5, 5, 5)
                arrow.name = 'arrow'

                arrow.onClickFunction = () => {
                    this.changeScene(name, arrow.floor)
                }

                if (graphCopy[name] === undefined) {
                    graphCopy[name] = {
                        pos: new THREE.Vector3(
                            intersects[0].point.x,
                            intersects[0].point.y,
                            intersects[0].point.z
                        ),
                        edge: [],
                        sticker: [],
                        floor: intersects[0].object.floor,
                        boxName: intersects[0].object.name,
                        path: pathName
                    }
                    arrow.floor = intersects[0].object.floor
                    arrow.delPath = {
                        path: name,
                        box: intersects[0].object.name
                    }
                    boxCopy[intersects[0].object.floor][
                        intersects[0].object.name
                    ].point.push(name)
                } else {
                    arrow.floor = this.state.graph[name].floor
                    arrow.delPath = {
                        path: name,
                        box: this.state.graph[name].boxName
                    }
                }

                this.planScene.add(arrow)
                graphCopy[this.state.currentSphere.name].edge.push(arrow)
                controlsCopy.addingPoint = false
            } else if (this.state.currentSphere && doubleClick) {
                let min = Number.MAX_SAFE_INTEGER
                let dist, nearestScene
                for (const point of boxCopy[intersects[0].object.floor][
                    intersects[0].object.name
                ].point) {
                    if (
                        graphCopy[point].boxName === intersects[0].object.name
                    ) {
                        dist = Math.sqrt(
                            Math.pow(
                                intersects[0].point.x - graphCopy[point].pos.x,
                                2
                            ) +
                                Math.pow(
                                    intersects[0].point.y -
                                        graphCopy[point].pos.y,
                                    2
                                ) +
                                Math.pow(
                                    intersects[0].point.z -
                                        graphCopy[point].pos.z,
                                    2
                                )
                        )
                        if (dist < min) {
                            nearestScene = point
                            min = dist
                        }
                    }
                }
                if (nearestScene !== undefined) {
                    this.changeScene(nearestScene, intersects[0].object.floor)
                }
            } else if (
                !this.state.currentSphere &&
                !doubleClick &&
                !this.state.controls.addingBox &&
                !this.state.controls.moving
            ) {
                const geometry = new THREE.SphereGeometry(500, 32, 32)
                const texture = new THREE.TextureLoader().load(pathName)
                texture.wrapS = THREE.RepeatWrapping
                texture.repeat.x = -1
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide
                })
                const sphere = new THREE.Mesh(geometry, material)
                sphere.name = name
                sphere.floor = intersects[0].object.floor
                this.mainScene.add(sphere)

                graphCopy[name] = {
                    pos: new THREE.Vector3(
                        intersects[0].point.x,
                        intersects[0].point.y,
                        intersects[0].point.z
                    ),
                    edge: [],
                    sticker: [],
                    floor: intersects[0].object.floor,
                    boxName: intersects[0].object.name,
                    path: pathName
                }
                boxCopy[intersects[0].object.floor][
                    intersects[0].object.name
                ].point.push(name)

                this.planCamera.position.set(
                    graphCopy[name].pos.x,
                    graphCopy[name].pos.y + 7,
                    graphCopy[name].pos.z
                )
                this.planCamera.lookAt(
                    graphCopy[name].pos.x,
                    graphCopy[name].pos.y,
                    graphCopy[name].pos.z
                )
                this.planControls.target.set(
                    graphCopy[name].pos.x,
                    graphCopy[name].pos.y,
                    graphCopy[name].pos.z
                )
                this.setState({
                    currentSphere: sphere
                })
            }
        }
        this.setState({
            graph: graphCopy,
            box: boxCopy,
            controls: controlsCopy
        })
    }

    changeScene = (path, floor) => {
        const currentSphereCopy = Object.assign({}, this.state.currentSphere)
        let temp = []
        for (const obj of this.mainScene.children) {
            if (obj.name === 'arrow' || obj.name === 'sticker') {
                temp.push(obj)
            }
        }
        for (const item of temp) {
            this.mainScene.remove(item)
        }
        const texture = new THREE.TextureLoader().load(
            this.state.graph[path].path
        )
        texture.wrapS = THREE.RepeatWrapping
        texture.repeat.x = -1
        currentSphereCopy.material.map = texture
        currentSphereCopy.name = path
        currentSphereCopy.floor = floor
        for (let arrow of this.state.graph[currentSphereCopy.name].edge) {
            this.mainScene.add(arrow)
        }
        for (let sticker of this.state.graph[currentSphereCopy.name].sticker) {
            this.mainScene.add(sticker)
        }

        this.planCamera.position.set(
            this.state.graph[path].pos.x,
            this.state.graph[path].pos.y + 7,
            this.state.graph[path].pos.z
        )
        this.planCamera.lookAt(
            this.state.graph[path].pos.x,
            this.state.graph[path].pos.y,
            this.state.graph[path].pos.z
        )
        this.planControls.target.set(
            this.state.graph[path].pos.x,
            this.state.graph[path].pos.y,
            this.state.graph[path].pos.z
        )
        this.planControls.update()

        this.mainCamera.position.set(0, 0, 0)
        this.mainCamera.lookAt(-10, 0, 0)
        this.mainControls.target.set(-10, 0, 0)
        this.mainControls.update()

        this.setState({
            currentSphere: currentSphereCopy
        })
    }

    addBox = () => {
        const controlsCopy = Object.assign({}, this.state.controls)
        const boxCopy = Object.assign({}, this.state.box)
        if (this.state.controls.addingBox === false) {
            controlsCopy.addingBox = true
            for (const floor in boxCopy) {
                for (const room in boxCopy[floor]) {
                    boxCopy[floor][room].cubeObject.visible = false
                }
            }
            this.setState({ box: boxCopy })
        } else {
            controlsCopy.addingBox = false

            const name =
                document.getElementById('boxName').value !== ''
                    ? document.getElementById('boxName').value
                    : ''

            for (const obj of this.planScene.children) {
                if (obj.visible) {
                    this.planScene.remove(obj)
                }
            }
        }
        this.setState({ controls: controlsCopy }, this.resizeWindow)
    }

    showPlan = () => {
        const planStateCopy = Object.assign({}, this.state.planState)
        planStateCopy.show = !this.state.planState.show
        this.setState({ planState: planStateCopy }, this.resizeWindow)
    }

    createBox = () => {
        if (this.state.controls.addingBox) {
            const x =
                document.getElementById('boxWidth').value !== ''
                    ? document.getElementById('boxWidth').value
                    : 0
            const y =
                document.getElementById('boxHeight').value !== ''
                    ? document.getElementById('boxHeight').value
                    : 0
            const z =
                document.getElementById('boxDepth').value !== ''
                    ? document.getElementById('boxDepth').value
                    : 0
            const leftImg =
                document.getElementById('left').value !== ''
                    ? document.getElementById('left').value
                    : ''
            const rightImg =
                document.getElementById('right').value !== ''
                    ? document.getElementById('right').value
                    : ''
            const topImg =
                document.getElementById('top').value !== ''
                    ? document.getElementById('top').value
                    : ''
            const bottomImg =
                document.getElementById('bottom').value !== ''
                    ? document.getElementById('bottom').value
                    : ''
            const frontImg =
                document.getElementById('front').value !== ''
                    ? document.getElementById('front').value
                    : ''
            const backImg =
                document.getElementById('back').value !== ''
                    ? document.getElementById('back').value
                    : ''
            const name =
                document.getElementById('boxName').value !== ''
                    ? document.getElementById('boxName').value
                    : ''
            for (const obj of this.planScene.children) {
                console.log(this.planScene.children)
                if (obj.visible) {
                    this.planScene.remove(obj)
                }
            }
            const side = [
                leftImg,
                rightImg,
                topImg,
                bottomImg,
                frontImg,
                backImg
            ]
            const geometry = new THREE.BoxGeometry(x, y, z)
            const material = []
            for (const i in side) {
                const texture = new THREE.TextureLoader().load(side[i])
                texture.wrapS = THREE.RepeatWrapping
                texture.repeat.x = -1
                material.push(
                    new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.BackSide
                    })
                )
            }
            const cube = new THREE.Mesh(geometry, material)
            cube.position.set(0, y / 2, 0)
            cube.name = name
            this.planScene.add(cube)
        }
    }

    moveBox = () => {
        const name = document.getElementById('boxName').value

        const controlsCopy = Object.assign({}, this.state.controls)
        const boxCopy = Object.assign({}, this.state.box)
        if (name !== '') {
            if (!controlsCopy.moving) {
                controlsCopy.moving = true
                controlsCopy.addingBox = false

                const geometry = new THREE.PlaneBufferGeometry(500, 500)
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.2,
                    side: THREE.DoubleSide,
                    transparent: true
                })
                const plane = new THREE.Mesh(geometry, material)
                this.planScene.add(plane)
                plane.name = 'invisiblePlane'
                plane.position.set(0, 0, 0)
                plane.floor = -1
                plane.rotateX(Math.PI / 2)

                for (const path in this.state.graph) {
                    if (
                        this.state.currentSphere &&
                        path === this.state.currentSphere.name
                    ) {
                        this.planCamera.position.set(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y + 10,
                            this.state.graph[path].pos.z
                        )
                        this.planCamera.lookAt(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y,
                            this.state.graph[path].pos.z
                        )
                        this.planControls.target.set(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y,
                            this.state.graph[path].pos.z
                        )
                        this.planControls.update()
                        break
                    } else {
                        this.planCamera.position.set(0, 10, 0)
                        this.planCamera.lookAt(0, 0, 0)
                        this.planControls.target.set(0, 0, 0)
                        this.planControls.update()
                    }
                }

                let left = Number.MAX_SAFE_INTEGER
                for (const floor in this.state.box) {
                    for (const room in this.state.box[floor]) {
                        if (
                            this.state.box[floor][room].cubeObject.position.x -
                                this.state.box[floor][room].cubeObject.geometry
                                    .parameters.width /
                                    2 <
                            left
                        ) {
                            left =
                                this.state.box[floor][room].cubeObject.position
                                    .x -
                                this.state.box[floor][room].cubeObject.geometry
                                    .parameters.width /
                                    2
                        }
                    }
                }

                for (const obj of this.planScene.children) {
                    if (obj.name === name) {
                        if (left === Number.MAX_SAFE_INTEGER) {
                            left = 0
                        }
                        obj.position.set(
                            left - obj.geometry.parameters.width / 2,
                            obj.geometry.parameters.height / 2,
                            0
                        )
                        obj.floor = 0
                        if (boxCopy[obj.floor] === undefined) {
                            boxCopy[obj.floor] = {}
                        }
                        boxCopy[obj.floor][obj.name] = {
                            cubeObject: obj,
                            point: [],
                            boundingBox: new THREE.Box3().setFromObject(obj)
                        }
                    }
                    if (obj.name !== 'invisiblePlane') {
                        for (const mat of obj.material) {
                            mat.side = THREE.FrontSide
                        }
                    }
                }
                this.setState({
                    controls: controlsCopy,
                    box: boxCopy
                })
            } else {
                controlsCopy.moving = false

                for (let obj of this.planScene.children) {
                    if (obj.name === 'invisiblePlane') {
                        this.planScene.remove(obj)
                    }
                }

                for (const floor in this.state.box) {
                    for (const room in this.state.box[floor]) {
                        for (const mat of this.state.box[floor][room].cubeObject
                            .material) {
                            mat.side = THREE.BackSide
                        }
                        for (const path in this.state.graph) {
                            for (const arrow of this.state.graph[path].edge) {
                                arrow.floor = this.state.graph[
                                    arrow.delPath.path
                                ].floor
                            }
                        }
                    }
                }

                for (const path in this.state.graph) {
                    if (
                        this.state.currentSphere &&
                        path === this.state.currentSphere.name
                    ) {
                        this.planCamera.position.set(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y + 7,
                            this.state.graph[path].pos.z
                        )
                        this.planCamera.lookAt(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y,
                            this.state.graph[path].pos.z
                        )
                        this.planControls.target.set(
                            this.state.graph[path].pos.x,
                            this.state.graph[path].pos.y,
                            this.state.graph[path].pos.z
                        )
                        this.planControls.update()
                        break
                    } else {
                        this.planCamera.position.set(0, 10, 0)
                        this.planCamera.lookAt(0, 0, 0)
                        this.planControls.target.set(0, 0, 0)
                        this.planControls.update()
                    }
                }
                this.setState(
                    {
                        controls: controlsCopy,
                        box: boxCopy
                    },
                    this.resizeWindow
                )
            }
        }
    }

    setBoxPosition = () => {
        this.raycaster.setFromCamera(this.planMouse, this.planCamera)
        let intersects = this.raycaster.intersectObjects(
            this.planScene.children
        )
        if (intersects.length > 0) {
            if (
                !this.focusedObject &&
                intersects[0].object.name !== 'invisiblePlane'
            ) {
                this.focusedObject = intersects[0].object
                if (this.focusedObject) {
                    let targetPos

                    if (intersects[0].object.name === this.focusedObject.name) {
                        targetPos = intersects[1].point
                    } else {
                        targetPos = intersects[0].point
                    }

                    targetPos.y +=
                        this.focusedObject.geometry.parameters.height / 2 +
                        0.0000000001

                    const relativePos = targetPos
                        .clone()
                        .sub(this.focusedObject.position)

                    const boundingBox = this.state.box[
                        this.focusedObject.floor
                    ][this.focusedObject.name].boundingBox
                        .clone()
                        .translate(relativePos)

                    let overlap = false
                    for (const floor in this.state.box) {
                        for (const room in this.state.box[floor]) {
                            if (
                                this.state.box[floor][room].cubeObject.name !==
                                    this.focusedObject.name &&
                                boundingBox.intersectsBox(
                                    this.state.box[floor][room].boundingBox
                                )
                            ) {
                                overlap = true
                                break
                            }
                        }
                        if (overlap) {
                            break
                        }
                    }

                    if (overlap) {
                        targetPos.copy(this.focusedObject.position)
                    } else {
                        if (
                            intersects[0].object.name ===
                            this.focusedObject.name
                        ) {
                            this.focusedObject.floor =
                                intersects[1].object.floor + 1
                        } else {
                            this.focusedObject.floor =
                                intersects[0].object.floor + 1
                        }
                    }

                    this.focusedObject.position.copy(targetPos)

                    let tempBoxData = null
                    const boxCopy = Object.assign({}, this.state.box)
                    const graphCopy = Object.assign({}, this.state.graph)
                    for (const floor in this.state.box) {
                        for (const room in this.state.box[floor]) {
                            if (
                                this.state.box[floor][room].cubeObject.name ===
                                this.focusedObject.name
                            ) {
                                if (
                                    this.state.currentSphere &&
                                    this.focusedObject.name ===
                                        this.state.currentSphere.name
                                ) {
                                    const currentSphereCopy = Object.assign(
                                        {},
                                        this.state.currentSphere
                                    )
                                    currentSphereCopy.floor = this.focusedObject.floor
                                    this.setState({
                                        currentState: currentSphereCopy
                                    })
                                }
                                tempBoxData = this.state.box[floor][room]
                                delete boxCopy[floor][room]
                                break
                            }
                        }
                        if (tempBoxData) {
                            break
                        }
                    }

                    if (
                        this.state.box[this.focusedObject.floor] === undefined
                    ) {
                        boxCopy[this.focusedObject.floor] = {}
                    }

                    boxCopy[this.focusedObject.floor][
                        this.focusedObject.name
                    ] = {
                        cubeObject: tempBoxData.cubeObject,
                        point: tempBoxData.point,
                        boundingBox: new THREE.Box3().setFromObject(
                            tempBoxData.cubeObject
                        )
                    }

                    if (!overlap) {
                        for (const name of tempBoxData.point) {
                            graphCopy[name].pos.x += relativePos.x
                            graphCopy[name].pos.y += relativePos.y
                            graphCopy[name].pos.z += relativePos.z
                            graphCopy[name].floor = this.focusedObject.floor
                        }
                    }

                    for (const path in graphCopy) {
                        if (path.boxName === this.focusedObject.name) {
                            path.floor = this.focusedObject.floor
                        }
                    }

                    this.setState({
                        graph: graphCopy,
                        box: boxCopy
                    })
                }
            }
        }
    }

    changeBoxVisibility = () => {
        const boxCopy = Object.assign({}, this.state.box)
        if (this.state.controls.moving) {
            for (const floor in boxCopy) {
                for (const room in boxCopy[floor]) {
                    boxCopy[floor][room].cubeObject.visible = true
                }
            }
            return
        } else if (!this.state.controls.addingBox && this.state.currentSphere) {
            for (const floor in boxCopy) {
                if (
                    this.planCamera.rotation.x < -Math.PI / 6 &&
                    floor > this.state.currentSphere.floor
                ) {
                    //above
                    for (const room in boxCopy[floor]) {
                        boxCopy[floor][room].cubeObject.visible = false
                    }
                } else if (
                    this.planCamera.rotation.x > Math.PI / 6 &&
                    floor < this.state.currentSphere.floor
                ) {
                    //below
                    for (const room in boxCopy[floor]) {
                        boxCopy[floor][room].cubeObject.visible = false
                    }
                } else {
                    for (const room in boxCopy[floor]) {
                        boxCopy[floor][room].cubeObject.visible = false
                    }
                }
            }
        }
        this.setState({
            box: boxCopy
        })
    }

    addSticker = () => {
        this.raycaster.setFromCamera(this.mainMouse, this.mainCamera)
        const intersects = this.raycaster.intersectObjects(
            this.mainScene.children
        )
        const normal = intersects[intersects.length - 1].point.normalize()
        const xzPlane = new THREE.Vector3(normal.x, 0, normal.z).normalize()
        const xyPlane = new THREE.Vector3(-1 + Math.abs(normal.y), normal.y, 0)

        let xzAngle = Math.acos(xzPlane.dot(new THREE.Vector3(-1, 0, 0)))
        let xyAngle = Math.acos(xyPlane.dot(new THREE.Vector3(-1, 0, 0)))

        if (normal.z < 0) {
            xzAngle = -xzAngle
        }
        if (normal.y < 0) {
            xyAngle = -xyAngle
        }

        const geometry = new THREE.PlaneGeometry(25, 25)
        const texture = new THREE.TextureLoader().load('love.png')
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: true
        })
        const sticker = new THREE.Mesh(geometry, material)
        sticker.position.copy(normal.multiplyScalar(450))
        sticker.rotateY(Math.PI / 2 + xzAngle)
        sticker.rotateX(xyAngle)
        sticker.name = 'sticker'
        this.mainScene.add(sticker)

        const graphCopy = Object.assign({}, this.state.graph)
        graphCopy[this.state.currentSphere.name].sticker.push(sticker)
        this.setState({ graph: graphCopy })
    }

    addingPoint = () => {
        const controlsCopy = Object.assign({}, this.state.controls)
        controlsCopy.addingPoint = true
        this.setState({ controls: controlsCopy })
    }

    deletePoint = () => {
        const controlsCopy = Object.assign({}, this.state.controls)
        controlsCopy.deletePoint = true
        this.setState({ controls: controlsCopy })
    }

    render = () => {
        if (!this.state.loading) {
            return (
                <MainDiv controls={this.state.controls}>
                    <CanvasDiv>
                        <MainView
                            scene={this.mainScene}
                            camera={this.mainCamera}
                            renderer={this.mainRenderer}
                            orbitControls={this.mainControls}
                            mouse={this.mainMouse}
                            raycaster={this.raycaster}
                            state={this.state.mainState}
                            graph={this.state.graph}
                            box={this.state.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                            mouseDown={this.onCanvasMouseDown}
                            doubleClick={this.onCanvasDoubleClick}
                        />
                        <PlanView
                            scene={this.planScene}
                            camera={this.planCamera}
                            renderer={this.planRenderer}
                            orbitControls={this.planControls}
                            mouse={this.planMouse}
                            raycaster={this.raycaster}
                            state={this.state.planState}
                            graph={this.state.graph}
                            box={this.state.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                            mouseDown={this.onPlanMouseDown}
                            mouseUp={this.onPlanMouseUp}
                            doubleClick={this.onPlanDoubleClick}
                        />
                        <TopTab
                            canOpen={
                                !this.state.controls.addingBox &&
                                !this.state.controls.moving
                            }
                            showPlan={this.showPlan}
                            websiteLink={this.state.websiteLink}
                        />
                        <RightTab
                            canOpen={
                                !this.state.controls.addingBox &&
                                !this.state.controls.moving
                            }
                        />
                    </CanvasDiv>
                    {this.state.env === 'dev' && (
                        <DevTab
                            controls={this.state.controls}
                            addPoint={this.addingPoint}
                            deletePoint={this.deletePoint}
                            addBox={this.addBox}
                            createBox={this.createBox}
                            moveBox={this.moveBox}
                            saveState={this.saveState}
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
