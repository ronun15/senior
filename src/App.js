import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'
import { saveAs } from 'file-saver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import OrbitControls from './lib/orbitControls'
import THREEx from './lib/chromakey'

import MainView from './components/mainView'
import PlanView from './components/planView'
import DevTab from './components/devTab'
import Menu from './components/menu'
import Bottomtab from './components/bottomTab'
import Map from './components/map'
import Help from './components/help'
import DropDown from './components/dropDown'

const MainDiv = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    font-family: 'Kanit', sans-serif;
`

const CanvasDiv = styled.div`
    position: relative;
    overflow: hidden;
    width: ${props => (props.env === 'dev' ? '80%' : '100%')};
    height: 100%;
`

const BottomButton = styled.input`
    height: 75%;
    margin: auto;
    border: ${props => (props.select ? '3px solid red' : null)};
    border-radius: ${props => (props.select ? '10px' : null)};
`

const BottomVideo = styled.video`
    height: 75%;
    margin: auto;
    border: ${props => (props.select ? '3px solid red' : null)};
    border-radius: ${props => (props.select ? '10px' : null)};
    cursor: pointer;
`

const Shader = styled.div`
    width: 100%;
    height: 100%;
    z-index: ${props => (props.show ? 2 : -1)};
    position: absolute;
    background-color: #463d4c;
    opacity: 0.5;
    top: 0;
    left: 0;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
`

const LoadingDiv = styled.div`
    width: 100vw;
    height: 100vh;
    font-size: 10rem;
    background-color: black;
    color: white;
    display: flex;
`

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            env: 'dev',
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            reload: true,
            latitude: 0,
            longtitude: 0,
            loading: true,
            mainState: {
                height: 0,
                width: 0
            },
            planState: {
                height: 0,
                width: 0
            },
            currentSphere: null,
            controls: {
                addingPoint: false,
                deletePoint: false,
                addingBox: false,
                moving: false,
                boxFirstPoint: false,
                showPlan: false,
                showMap: false,
                showSticker: false,
                showFront: false,
                showBack: false,
                showHelp: false
            },
            stickerList: [],
            layerList: {
                front: [],
                back: []
            },
            videoList: [],
            currentSticker: null,
            startingPoint: null,
            websiteLink: ''
        }
    }

    componentDidMount = async () => {
        const data = await this.getData()
        if (data === undefined) {
            return
        }
        console.log(data.graph)
        this.setState({
            latitude: data.latitude,
            longtitude: data.longtitude,
            startingPoint: data.startingPoint,
            stickerList: data.stickerList,
            currentSticker: data.stickerList[0],
            //layerList: data.layerList,
            websiteLink: data.websiteLink
        })
        this.graph = { ...data.graph }
        this.box = { ...data.box }

        this.mainScene = new THREE.Scene()
        this.mainCamera = new THREE.PerspectiveCamera(
            55,
            this.state.mainState.width / this.state.mainState.height,
            0.1,
            1000
        )
        this.mainRenderer = new THREE.WebGLRenderer()
        this.mainControls = new OrbitControls(
            this.mainCamera,
            this.mainRenderer.domElement
        )
        this.mainMouse = new THREE.Vector2()

        this.planScene = new THREE.Scene()
        this.planCamera = new THREE.PerspectiveCamera(
            55,
            this.state.planState.width / this.state.planState.height,
            0.1,
            1000
        )
        this.planRenderer = new THREE.WebGLRenderer()
        this.planControls = new OrbitControls(
            this.planCamera,
            this.planRenderer.domElement
        )
        this.planMouse = new THREE.Vector2()

        this.raycaster = new THREE.Raycaster()

        this.hold = false
        this.click = 0
        this.focusedObject = null
        this.createdObject = { material: [] }
        if (data.startingPoint) {
            const file = data.graph[data.startingPoint].image
            const floor = data.graph[data.startingPoint].floor

            new THREE.TextureLoader().load(file, texture => {
                texture.wrapS = THREE.RepeatWrapping
                texture.repeat.x = -1
                const geometry = new THREE.SphereGeometry(500, 32, 32)
                const material = new THREE.MeshBasicMaterial({
                    side: THREE.BackSide,
                    map: texture,
                    transparent: true,
                    alphaTest: 0.7
                })
                const sphere = new THREE.Mesh(geometry, material)
                sphere.name = data.startingPoint
                this.mainScene.add(sphere)
                this.setState(
                    {
                        currentSphere: sphere
                    },
                    () => {
                        const loader = new THREE.ObjectLoader()

                        for (const name in data.graph) {
                            this.graph[name] = { ...data.graph[name] }

                            this.graph[name].edge = []
                            this.graph[name].sticker = []
                            for (const arrow of data.graph[name].edge) {
                                const object = loader.parse(arrow)
                                object.material.map.image.src =
                                    object.userData.src
                                object.onClickFunction = () => {
                                    this.changeScene(
                                        object.userData.onClickFunctionName,
                                        object.userData.onClickFunctionFloor
                                    )
                                }
                                this.graph[name].edge.push(object)
                            }
                            for (const sticker of data.graph[name].sticker) {
                                const object = loader.parse(sticker)
                                object.material.map.image.src =
                                    object.userData.src
                                this.graph[name].sticker.push(object)
                            }
                            this.graph[name].pos = new THREE.Vector3(
                                data.graph[name].pos.x,
                                data.graph[name].pos.y,
                                data.graph[name].pos.z
                            )
                        }

                        for (const floor in data.box) {
                            for (const room in data.box[floor]) {
                                this.box[floor][room] = {
                                    ...data.box[floor][room]
                                }

                                const object = loader.parse(
                                    data.box[floor][room].cubeObject
                                )
                                this.box[floor][room].cubeObject = object
                                this.planScene.add(object)

                                this.box[floor][
                                    room
                                ].boundingBox = new THREE.Box3(
                                    data.box[floor][room].boundingBox.min,
                                    data.box[floor][room].boundingBox.max
                                )
                            }
                        }
                        this.changeScene(data.startingPoint, floor)
                    }
                )
            })
        }

        window.addEventListener('resize', this.resizeWindow)
        window.addEventListener('mousemove', this.onMouseMove)

        this.start()
        await this.setState(
            {
                loading: false
            },

            this.resizeWindow
        )
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
        if (this.state.controls.moving && this.hold) {
            this.setBoxPosition()
        }
        this.changeBoxVisibility()
        this.frameId = requestAnimationFrame(this.animate)
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    saveState = () => {
        const graphCopy = { ...this.graph }
        for (const name in this.graph) {
            graphCopy[name] = { ...this.graph[name] }
            graphCopy[name].layer = {}
            graphCopy[name].layer.front = []
            graphCopy[name].layer.back = []
            graphCopy[name].edge = []
            graphCopy[name].sticker = []
            for (const arrow of this.graph[name].edge) {
                graphCopy[name].edge.push(arrow.toJSON())
            }
            for (const sticker of this.graph[name].sticker) {
                graphCopy[name].sticker.push(sticker.toJSON())
            }
            for (const item in this.graph[name].layer.front) {
                graphCopy[name].layer.front.push(
                    this.graph[name].layer.front[item]
                )
            }
            for (const item in this.graph[name].layer.back) {
                graphCopy[name].layer.back.push(
                    this.graph[name].layer.back[item]
                )
            }
        }
        const boxCopy = { ...this.box }
        for (const floor in this.box) {
            boxCopy[floor] = { ...this.box[floor] }
            for (const room in this.box[floor]) {
                boxCopy[floor][room] = { ...this.box[floor][room] }
                boxCopy[floor][room].cubeObject = this.box[floor][
                    room
                ].cubeObject.toJSON()
            }
        }
        setTimeout(() => {
            const data = {
                latitude: this.state.latitude,
                longtitude: this.state.longtitude,
                startingPoint: this.state.startingPoint,
                stickerList: this.state.stickerList,
                websiteLink: this.state.websiteLink,
                graph: graphCopy,
                box: boxCopy
            }
            const output = JSON.stringify(data)
            let blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
            saveAs(blob, 'output.json')
        }, 1000)
    }

    getData = async () => {
        let query = new URLSearchParams(window.location.search)
        if (query.has('env')) {
            const env = query.get('env')
            this.setState({
                env: env
            })
        } else {
            this.setState({
                env: ''
            })
        }
        if (query.has('input')) {
            const file = query.get('input')
            try {
                const output = require(`../data/${file}`)
                output.load = true
                return output
            } catch (e) {
                console.log(e)
                alert(`can not find ${file}\n${e}`)
            }
        } else {
            return {
                graph: {},
                box: {},
                latitude: 13.736851,
                longtitude: 100.533144,
                startingPoint: undefined,
                stickerList: [],
                websiteLink: '',
                load: false
            }
        }
    }

    resizeWindow = () => {
        this.setState(
            {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            },
            () => {
                const mainStateCopy = { ...this.state.mainState }
                mainStateCopy.width =
                    this.state.env === 'dev'
                        ? 0.8 * this.state.width
                        : this.state.width

                const planStateCopy = { ...this.state.planState }
                planStateCopy.width =
                    this.state.env === 'dev'
                        ? 0.8 * this.state.width
                        : this.state.width

                if (
                    this.state.controls.addingBox ||
                    this.state.controls.moving ||
                    this.state.controls.boxFirstPoint
                ) {
                    mainStateCopy.height = 0
                    planStateCopy.height = this.state.height
                } else if (this.state.controls.showPlan) {
                    mainStateCopy.height = 0.6 * this.state.height
                    planStateCopy.height = 0.4 * this.state.height
                } else {
                    mainStateCopy.height = this.state.height
                    planStateCopy.height = 0
                }

                this.setState({
                    mainState: mainStateCopy,
                    planState: planStateCopy
                })
            }
        )
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
            if (!this.state.controls.addingBox && !this.state.controls.moving) {
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
        const controlsCopy = { ...this.state.controls }

        this.raycaster.setFromCamera(this.mainMouse, this.mainCamera)
        const intersects = this.raycaster.intersectObjects(
            this.mainScene.children
        )
        if (intersects.length > 0 && intersects[0].object.name === 'arrow') {
            if (this.state.controls.deletePoint) {
                const path = intersects[0].object.userData.delPath.name
                const pos = this.box[intersects[0].object.userData.floor][
                    intersects[0].object.userData.delPath.box
                ].point.indexOf(path)
                this.box[intersects[0].object.userData.floor][
                    intersects[0].object.userData.delPath.box
                ].point.splice(pos, 1)

                for (const name in this.graph) {
                    let temp = []
                    for (const edge of this.graph[name].edge) {
                        if (edge.userData.delPath.name === path) {
                            temp.push(edge)
                        }
                    }
                    for (const item of temp) {
                        const pos = this.graph[name].edge.indexOf(item)
                        this.graph[name].edge.splice(pos, 1)
                    }
                }
                if (path === this.state.startingPoint) {
                    this.setState({
                        startingPoint: this.state.currentSphere.name
                    })
                }

                delete this.graph[path]
                controlsCopy.deletePoint = false
                this.changeScene(
                    this.state.currentSphere.name,
                    this.state.currentSphere.userData.floor
                )
            } else {
                intersects[0].object.onClickFunction()
            }
        }
        this.setState({
            controls: controlsCopy
        })
    }

    raycastPlan = doubleClick => {
        const controlsCopy = { ...this.state.controls }

        this.raycaster.setFromCamera(this.planMouse, this.planCamera)
        const intersects = this.raycaster.intersectObjects(
            this.planScene.children
        )
        if (intersects.length > 0) {
            if (
                this.state.currentSphere &&
                !doubleClick &&
                this.state.controls.addingPoint &&
                !this.state.controls.boxFirstPoint &&
                document.getElementById('path').value
            ) {
                const file = document.getElementById('path').files[0]
                const name = file.name
                    .split('/')
                    .pop()
                    .split('.')[0]
                const reader = new FileReader()
                let dataUrl
                if (!file.type.startsWith('image')) {
                    alert('image only')
                    return
                }
                reader.onload = e => {
                    dataUrl = e.target.result
                    if (name !== this.state.currentSphere.name) {
                        if (
                            this.graph[this.state.currentSphere.name]
                                .boxName !== intersects[0].object.name &&
                            this.box[intersects[0].object.userData.floor][
                                intersects[0].object.name
                            ].point.indexOf(name) === -1 &&
                            !this.graph[name]
                        ) {
                            this.graph[name] = {
                                pos: new THREE.Vector3(
                                    intersects[0].point.x,
                                    intersects[0].point.y,
                                    intersects[0].point.z
                                ),
                                edge: [],
                                sticker: [],
                                layer: { front: [], back: [] },
                                floor: intersects[0].object.userData.floor,
                                boxName: intersects[0].object.name,
                                image: dataUrl
                            }

                            this.box[intersects[0].object.userData.floor][
                                intersects[0].object.name
                            ].point.push(name)
                            this.changeScene(
                                name,
                                intersects[0].object.userData.floor
                            )
                        } else {
                            const pos = this.graph[
                                this.state.currentSphere.name
                            ].pos
                            const xDif = intersects[0].point.x - pos.x
                            const yDif = intersects[0].point.z - pos.z
                            const rad = Math.atan2(yDif, xDif) + Math.PI

                            const geometry = new THREE.PlaneGeometry(5, 5, 32)
                            new THREE.TextureLoader().load(
                                'arrow.png',
                                texture => {
                                    const material = new THREE.MeshBasicMaterial(
                                        {
                                            map: texture,
                                            transparent: true,
                                            side: THREE.DoubleSide,
                                            alphaTest: 0.7
                                        }
                                    )

                                    const arrow = new THREE.Mesh(
                                        geometry,
                                        material
                                    )
                                    const newPoint =
                                        this.graph[name] === undefined

                                    if (newPoint) {
                                        this.graph[name] = {
                                            pos: new THREE.Vector3(
                                                intersects[0].point.x,
                                                intersects[0].point.y,
                                                intersects[0].point.z
                                            ),
                                            edge: [],
                                            sticker: [],
                                            layer: { front: [], back: [] },
                                            floor:
                                                intersects[0].object.userData
                                                    .floor,
                                            boxName: intersects[0].object.name,
                                            image: dataUrl
                                        }
                                        arrow.userData.floor =
                                            intersects[0].object.userData.floor
                                        arrow.userData.delPath = {
                                            name: name,
                                            box: intersects[0].object.name
                                        }
                                        this.box[
                                            intersects[0].object.userData.floor
                                        ][intersects[0].object.name].point.push(
                                            name
                                        )
                                    } else {
                                        arrow.userData.floor = this.graph[
                                            name
                                        ].floor
                                        arrow.userData.delPath = {
                                            name: name,
                                            box: this.graph[name].boxName
                                        }
                                    }
                                    arrow.userData.src = 'arrow.png'
                                    arrow.rotateX(Math.PI / 2)
                                    arrow.rotateZ(
                                        Math.PI / 2 +
                                            rad +
                                            intersects[0].object.userData
                                                .rotation
                                    )
                                    arrow.position.set(
                                        50 *
                                            Math.cos(
                                                rad -
                                                    Math.PI / 2 +
                                                    intersects[0].object
                                                        .userData.rotation
                                            ),
                                        -50,
                                        50 *
                                            Math.sin(
                                                rad -
                                                    Math.PI / 2 +
                                                    intersects[0].object
                                                        .userData.rotation
                                            )
                                    )
                                    arrow.scale.set(5, 5, 5)
                                    arrow.name = 'arrow'

                                    arrow.onClickFunction = () => {
                                        this.changeScene(
                                            name,
                                            arrow.userData.floor
                                        )
                                    }
                                    arrow.userData.onClickFunctionName = name
                                    arrow.userData.onClickFunctionFloor =
                                        arrow.userData.floor

                                    if (
                                        this.graph[
                                            this.state.currentSphere.name
                                        ].boxName ===
                                            intersects[0].object.name &&
                                        this.box[
                                            intersects[0].object.userData.floor
                                        ][
                                            intersects[0].object.name
                                        ].point.indexOf(name) !== -1
                                    ) {
                                        const reverseArrow = new THREE.Mesh(
                                            geometry,
                                            material
                                        )
                                        const currentName = this.state
                                            .currentSphere.name

                                        if (newPoint) {
                                            reverseArrow.userData.floor =
                                                intersects[0].object.userData.floor
                                            reverseArrow.userData.delPath = {
                                                name: currentName,
                                                box: intersects[0].object.name
                                            }
                                        } else {
                                            reverseArrow.userData.floor =
                                                intersects[0].object.userData.floor
                                            reverseArrow.userData.delPath = {
                                                name: currentName,
                                                box: this.graph[currentName]
                                                    .boxName
                                            }
                                        }
                                        reverseArrow.userData.src = 'arrow.png'
                                        reverseArrow.rotateX(Math.PI / 2)
                                        reverseArrow.rotateZ(
                                            -Math.PI / 2 +
                                                rad +
                                                intersects[0].object.userData
                                                    .rotation
                                        )
                                        reverseArrow.position.set(
                                            50 *
                                                Math.cos(
                                                    rad -
                                                        (3 * Math.PI) / 2 +
                                                        intersects[0].object
                                                            .userData.rotation
                                                ),
                                            -50,
                                            50 *
                                                Math.sin(
                                                    rad -
                                                        (3 * Math.PI) / 2 +
                                                        intersects[0].object
                                                            .userData.rotation
                                                )
                                        )
                                        reverseArrow.scale.set(5, 5, 5)
                                        reverseArrow.name = 'arrow'

                                        reverseArrow.onClickFunction = () => {
                                            this.changeScene(
                                                currentName,
                                                reverseArrow.userData.floor
                                            )
                                        }
                                        reverseArrow.userData.onClickFunctionName = currentName
                                        reverseArrow.userData.onClickFunctionFloor =
                                            reverseArrow.userData.floor
                                        this.graph[name].edge.push(reverseArrow)
                                    }

                                    this.graph[
                                        this.state.currentSphere.name
                                    ].edge.push(arrow)
                                    this.changeScene(name, arrow.userData.floor)
                                }
                            )
                        }

                        controlsCopy.addingPoint = false
                    }
                }
                reader.readAsDataURL(file)
            } else if (
                this.state.currentSphere &&
                doubleClick &&
                !this.state.controls.boxFirstPoint
            ) {
                let min = Number.MAX_SAFE_INTEGER
                let dist, nearestScene

                for (const point of this.box[
                    intersects[0].object.userData.floor
                ][intersects[0].object.name].point) {
                    if (
                        this.graph[point].boxName === intersects[0].object.name
                    ) {
                        dist = Math.sqrt(
                            Math.pow(
                                intersects[0].point.x - this.graph[point].pos.x,
                                2
                            ) +
                                Math.pow(
                                    intersects[0].point.y -
                                        this.graph[point].pos.y,
                                    2
                                ) +
                                Math.pow(
                                    intersects[0].point.z -
                                        this.graph[point].pos.z,
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
                    this.changeScene(
                        nearestScene,
                        intersects[0].object.userData.floor
                    )
                }
            } else if (
                // starting from scratch
                !doubleClick &&
                this.state.controls.boxFirstPoint &&
                this.state.controls.addingPoint &&
                document.getElementById('path').value
            ) {
                const file = document.getElementById('path').files[0]
                const name = file.name
                    .split('/')
                    .pop()
                    .split('.')[0]
                if (!file.type.startsWith('image')) {
                    alert('image only')
                    return
                }
                let newName = true
                for (const roomName in this.graph) {
                    if (!newName) break
                    if (roomName === name) {
                        newName = false
                    }
                }
                if (!newName) {
                    alert('name used')
                    return
                }

                if (
                    intersects[0].object.name !== 'invisiblePlane' &&
                    intersects[0].object.name !== 'arrowHelper'
                ) {
                    let sphere
                    const reader = new FileReader()
                    const loader = new THREE.TextureLoader()
                    reader.onload = e => {
                        loader.load(e.target.result, texture => {
                            texture.wrapS = THREE.RepeatWrapping
                            texture.repeat.x = -1
                            const geometry = new THREE.SphereGeometry(
                                500,
                                32,
                                32
                            )
                            const material = new THREE.MeshBasicMaterial({
                                map: texture,
                                side: THREE.BackSide,
                                transparent: true,
                                alphaTest: 0.7
                            })
                            sphere = new THREE.Mesh(geometry, material)
                            sphere.name = name
                            sphere.userData.floor =
                                intersects[0].object.userData.floor
                            this.mainScene.add(sphere)

                            this.graph[name] = {
                                pos: new THREE.Vector3(
                                    intersects[0].point.x,
                                    intersects[0].point.y,
                                    intersects[0].point.z
                                ),
                                edge: [],
                                sticker: [],
                                layer: { front: [], back: [] },
                                floor: intersects[0].object.userData.floor,
                                boxName: intersects[0].object.name,
                                image: e.target.result
                            }
                            this.box[intersects[0].object.userData.floor][
                                intersects[0].object.name
                            ].point.push(name)
                            this.setState(
                                {
                                    currentSphere: sphere
                                },
                                () => {
                                    const temp = []
                                    for (const obj of this.planScene.children) {
                                        if (
                                            obj.name === 'invisiblePlane' ||
                                            obj.name === 'arrowHelper'
                                        ) {
                                            temp.push(obj)
                                        } else if (
                                            obj.name === 'positionPoint'
                                        ) {
                                            obj.visible = true
                                        }
                                    }
                                    for (const obj of temp) {
                                        this.planScene.remove(obj)
                                    }
                                    if (!this.state.startingPoint) {
                                        this.setState({
                                            startingPoint: name
                                        })
                                    }
                                    this.changeScene(
                                        name,
                                        intersects[0].object.userData.floor
                                    )
                                }
                            )
                        })
                    }
                    reader.readAsDataURL(file)
                    controlsCopy.boxFirstPoint = false
                    controlsCopy.addingPoint = false
                }
            }
        }
        this.setState(
            {
                controls: controlsCopy
            },
            this.resizeWindow
        )
    }

    changeScene = (name, floor) => {
        const currentSphereCopy = { ...this.state.currentSphere }
        let temp = []
        for (const obj of this.mainScene.children) {
            if (obj.name === 'arrow' || obj.name === 'sticker') {
                temp.push(obj)
            }
        }
        for (const item of temp) {
            this.mainScene.remove(item)
        }
        temp = []
        for (const obj of this.planScene.children) {
            if (obj.name === 'positionPoint') {
                temp.push(obj)
            }
        }
        for (const item of temp) {
            this.planScene.remove(item)
        }

        new THREE.TextureLoader().load(this.graph[name].image, texture => {
            texture.wrapS = THREE.RepeatWrapping
            texture.repeat.x = -1
            currentSphereCopy.material.map = texture
            currentSphereCopy.name = name
            currentSphereCopy.userData.floor = floor

            for (const arrow of this.graph[currentSphereCopy.name].edge) {
                this.mainScene.add(arrow)
            }
            for (const sticker of this.graph[currentSphereCopy.name].sticker) {
                this.mainScene.add(sticker)
            }
            this.removeLayerChangeScene()
            this.addLayerChangeScene(
                'front',
                this.graph[currentSphereCopy.name].layer.front
            )
            this.addLayerChangeScene(
                'back',
                this.graph[currentSphereCopy.name].layer.back
            )
        })

        this.planCamera.position.set(
            this.graph[name].pos.x,
            this.graph[name].pos.y + 7,
            this.graph[name].pos.z
        )
        this.planCamera.lookAt(
            this.graph[name].pos.x,
            this.graph[name].pos.y,
            this.graph[name].pos.z
        )
        this.planControls.target.set(
            this.graph[name].pos.x,
            this.graph[name].pos.y,
            this.graph[name].pos.z
        )
        this.planControls.update()

        const geometry = new THREE.SphereGeometry(
            0.25,
            16,
            16,
            0,
            2 * Math.PI,
            0,
            0.5 * Math.PI
        )
        const material = new THREE.MeshBasicMaterial({
            color: 0xffc638
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = 'positionPoint'
        sphere.position.set(
            this.graph[name].pos.x,
            this.graph[name].pos.y,
            this.graph[name].pos.z
        )
        this.planScene.add(sphere)

        this.setState({
            currentSphere: currentSphereCopy
        })
    }

    addBox = () => {
        const controlsCopy = { ...this.state.controls }
        if (this.state.controls.addingBox === false) {
            controlsCopy.addingBox = true
            for (const obj of this.planScene.children) {
                obj.visible = false
            }
            this.createdObject.x = this.createdObject.y = this.createdObject.z = 1
            const geometry = new THREE.BoxGeometry(1, 1, 1)

            this.createdObject.material = [...Array(6).keys()].map(item => {
                return new THREE.MeshBasicMaterial({
                    side: THREE.BackSide,
                    transparent: true,
                    opacity: 0
                })
            })

            const cube = new THREE.Mesh(geometry, this.createdObject.material)
            cube.position.set(0, 0.5 + 0.0000000001, 0)
            cube.name = 'new_box'
            cube.userData.rotation = 0
            this.planScene.add(cube)
            this.planCamera.position.set(0, 10, 0)
            this.planCamera.lookAt(0, 0, 0)
            this.planControls.target.set(0, 0, 0)
        } else {
            controlsCopy.addingBox = false

            for (const obj of this.planScene.children) {
                if (obj.visible) {
                    this.planScene.remove(obj)
                } else {
                    obj.visible = true
                }
            }
            if (this.state.currentSphere) {
                this.changeScene(
                    this.state.currentSphere.name,
                    this.state.currentSphere.userData.floor
                )
            }
        }
        this.setState({ controls: controlsCopy }, this.resizeWindow)
    }

    createBox = type => {
        if (this.state.controls.addingBox) {
            for (const obj of this.planScene.children) {
                if (obj.visible) {
                    this.planScene.remove(obj)
                }
            }
            if (type === 'directory') {
                const dir = `asset/360/${
                    document.getElementById('boxFromDirectory').value
                }`
                const faceList = [
                    'left',
                    'right',
                    'top',
                    'bottom',
                    'front',
                    'back'
                ]
                const loader = new THREE.TextureLoader()
                faceList.map((item, index) => {
                    try {
                        const image = require(`../${dir}/${item}.png`)
                        loader.load(image, texture => {
                            texture.wrapS = THREE.RepeatWrapping
                            texture.repeat.x = -1
                            this.createdObject.material[
                                index
                            ] = new THREE.MeshBasicMaterial({
                                side: THREE.BackSide,
                                map: texture
                            })
                        })
                        return true
                    } catch (e) {
                        alert(`${dir}${item}.png not found`)
                        return false
                    }
                })
            } else if (type === 'x') {
                this.createdObject.x = Number(
                    document.getElementById('boxWidth').value
                )
            } else if (type === 'y') {
                this.createdObject.y = Number(
                    document.getElementById('boxHeight').value
                )
            } else if (type === 'z') {
                this.createdObject.z = Number(
                    document.getElementById('boxDepth').value
                )
            } else if (type === 'name') {
                this.createdObject.name = document.getElementById(
                    'boxName'
                ).value
            } else {
                const loader = new THREE.TextureLoader()
                let data, i
                if (type === 'left') {
                    data = document.getElementById('left').files[0]
                    i = 0
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('left').files[0] = ''
                        data = undefined
                    }
                } else if (type === 'right') {
                    data = document.getElementById('right').files[0]
                    i = 1
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('right').files[0] = ''
                        data = undefined
                    }
                } else if (type === 'top') {
                    data = document.getElementById('top').files[0]
                    i = 2
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('top').files[0] = ''
                        data = undefined
                    }
                } else if (type === 'bottom') {
                    data = document.getElementById('bottom').files[0]
                    i = 3
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('bottom').files[0] = ''
                        data = undefined
                    }
                } else if (type === 'front') {
                    data = document.getElementById('front').files[0]
                    i = 4
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('front').files[0] = ''
                        data = undefined
                    }
                } else if (type === 'back') {
                    data = document.getElementById('back').files[0]
                    i = 5
                    if (!data.type.startsWith('image')) {
                        alert('image only')
                        document.getElementById('back').files[0] = ''
                        data = undefined
                    }
                }
                if (data) {
                    const reader = new FileReader()
                    reader.onload = e => {
                        loader.load(e.target.result, texture => {
                            texture.wrapS = THREE.RepeatWrapping
                            texture.repeat.x = -1
                            this.createdObject.material[
                                i
                            ] = new THREE.MeshBasicMaterial({
                                side: THREE.BackSide,
                                map: texture
                            })
                        })
                    }
                    reader.readAsDataURL(data)
                } else {
                    this.createdObject.material[
                        i
                    ] = new THREE.MeshBasicMaterial({
                        side: THREE.BackSide
                    })
                }
            }
            const geometry = new THREE.BoxGeometry(
                this.createdObject.x,
                this.createdObject.y,
                this.createdObject.z
            )
            const cube = new THREE.Mesh(geometry, this.createdObject.material)
            cube.position.set(0, this.createdObject.y / 2 + 0.0000000001, 0)
            cube.name = this.createdObject.name
            cube.userData.rotation = 0
            this.planScene.add(cube)
        } else if (this.state.controls.moving && type === 'rotate') {
            const name = this.createdObject.name
            for (const obj of this.planScene.children) {
                if (obj.name === name) {
                    obj.rotation.set(0, 0, 0)
                    obj.rotateY(
                        (Number(document.getElementById('rotate').value) *
                            Math.PI) /
                            180
                    )
                    obj.userData.rotation =
                        (Number(document.getElementById('rotate').value) *
                            Math.PI) /
                        180
                }
            }
        }
    }

    moveBox = () => {
        const name = document.getElementById('boxName').value
        const controlsCopy = { ...this.state.controls }
        if (!controlsCopy.moving && !controlsCopy.boxFirstPoint) {
            let movable = true
            for (const floor in this.box) {
                for (const room in this.box[floor]) {
                    if (!movable) break
                    if (room === name) {
                        movable = false
                        alert('name used')
                    }
                }
                if (!movable) break
            }
            if (name === '') {
                alert('name cannot be blank')
            }

            if (movable && name !== '') {
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
                plane.userData.floor = 0
                plane.rotateX(Math.PI / 2)

                const dir = new THREE.Vector3(-1, 0, 0)
                const origin = new THREE.Vector3(0, 0, 0)
                const length = 30
                const hex = 0xff0000
                const arrowHelper = new THREE.ArrowHelper(
                    dir,
                    origin,
                    length,
                    hex
                )
                arrowHelper.name = 'arrowHelper'
                this.planScene.add(arrowHelper)

                for (const name in this.graph) {
                    if (
                        this.state.currentSphere &&
                        name === this.state.currentSphere.name
                    ) {
                        this.planCamera.position.set(
                            this.graph[name].pos.x,
                            this.graph[name].pos.y + 10,
                            this.graph[name].pos.z
                        )
                        this.planCamera.lookAt(
                            this.graph[name].pos.x,
                            this.graph[name].pos.y,
                            this.graph[name].pos.z
                        )
                        this.planControls.target.set(
                            this.graph[name].pos.x,
                            this.graph[name].pos.y,
                            this.graph[name].pos.z
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
                for (const floor in this.box) {
                    for (const room in this.box[floor]) {
                        if (
                            this.box[floor][room].cubeObject.position.x -
                                this.box[floor][room].cubeObject.geometry
                                    .parameters.width /
                                    2 <
                            left
                        ) {
                            left =
                                this.box[floor][room].cubeObject.position.x -
                                this.box[floor][room].cubeObject.geometry
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
                        obj.userData.floor = 1
                        this.planCamera.position.set(
                            left - obj.geometry.parameters.width / 2,
                            obj.geometry.parameters.height / 2 + 10,
                            0
                        )
                        this.planCamera.lookAt(
                            left - obj.geometry.parameters.width / 2,
                            obj.geometry.parameters.height / 2,
                            0
                        )
                        this.planControls.target.set(
                            left - obj.geometry.parameters.width / 2,
                            obj.geometry.parameters.height / 2,
                            0
                        )
                        if (this.box[obj.userData.floor] === undefined) {
                            this.box[obj.userData.floor] = {}
                        }
                        this.box[obj.userData.floor][obj.name] = {
                            cubeObject: obj,
                            point: [],
                            boundingBox: new THREE.Box3().setFromObject(obj)
                        }
                    }
                    if (
                        obj.name !== 'invisiblePlane' &&
                        obj.name !== 'positionPoint' &&
                        obj.name !== 'arrowHelper'
                    ) {
                        for (const mat of obj.material) {
                            mat.side = THREE.FrontSide
                        }
                    }
                }
                this.setState(
                    {
                        controls: controlsCopy
                    },
                    () => {
                        document.getElementById('boxWidth').value = ''
                        document.getElementById('boxHeight').value = ''
                        document.getElementById('boxDepth').value = ''
                        document.getElementById('left').value = ''
                        document.getElementById('right').value = ''
                        document.getElementById('top').value = ''
                        document.getElementById('bottom').value = ''
                        document.getElementById('front').value = ''
                        document.getElementById('back').value = ''
                        document.getElementById('boxFromDirectory').value = ''
                        document.getElementById('rotate').value = ''
                    }
                )
            }
        } else if (controlsCopy.moving && !controlsCopy.boxFirstPoint) {
            document.getElementById('boxName').value = ''
            controlsCopy.moving = false
            controlsCopy.boxFirstPoint = true

            for (const floor in this.box) {
                for (const room in this.box[floor]) {
                    for (const mat of this.box[floor][room].cubeObject
                        .material) {
                        mat.side = THREE.BackSide
                    }
                    for (const name in this.graph) {
                        for (const arrow of this.graph[name].edge) {
                            arrow.userData.floor = this.graph[
                                arrow.userData.delPath.name
                            ].floor
                        }
                    }
                }
            }

            this.setState({
                controls: controlsCopy
            })
        }
    }

    setBoxPosition = () => {
        this.raycaster.setFromCamera(this.planMouse, this.planCamera)
        const intersects = this.raycaster.intersectObjects(
            this.planScene.children
        )
        if (intersects.length > 0) {
            if (
                !this.focusedObject &&
                intersects[0].object.name !== 'invisiblePlane' &&
                intersects[0].object.name !== 'arrowHelper'
            ) {
                this.focusedObject = intersects[0].object
            }
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

                const boundingBox = this.box[this.focusedObject.userData.floor][
                    this.focusedObject.name
                ].boundingBox
                    .clone()
                    .translate(relativePos)

                let overlap = false
                for (const floor in this.box) {
                    for (const room in this.box[floor]) {
                        if (
                            this.box[floor][room].cubeObject.name !==
                                this.focusedObject.name &&
                            boundingBox.intersectsBox(
                                this.box[floor][room].boundingBox
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
                    if (intersects[0].object.name === this.focusedObject.name) {
                        this.focusedObject.userData.floor =
                            intersects[1].object.userData.floor + 1
                    } else {
                        this.focusedObject.userData.floor =
                            intersects[0].object.userData.floor + 1
                    }
                }

                this.focusedObject.position.copy(targetPos)

                let tempBoxData = null
                for (const floor in this.box) {
                    for (const room in this.box[floor]) {
                        if (
                            this.box[floor][room].cubeObject.name ===
                            this.focusedObject.name
                        ) {
                            if (
                                this.state.currentSphere &&
                                this.focusedObject.name ===
                                    this.state.currentSphere.name
                            ) {
                                const currentSphereCopy = {
                                    ...this.state.currentSphere
                                }
                                currentSphereCopy.userData.floor = this.focusedObject.userData.floor
                                this.setState({
                                    currentState: currentSphereCopy
                                })
                            }
                            tempBoxData = this.box[floor][room]
                            delete this.box[floor][room]
                            break
                        }
                    }
                    if (tempBoxData) {
                        break
                    }
                }

                if (this.box[this.focusedObject.userData.floor] === undefined) {
                    this.box[this.focusedObject.userData.floor] = {}
                }

                this.box[this.focusedObject.userData.floor][
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
                        this.graph[name].pos.x += relativePos.x
                        this.graph[name].pos.y += relativePos.y
                        this.graph[name].pos.z += relativePos.z
                        this.graph[
                            name
                        ].floor = this.focusedObject.userData.floor
                    }
                }

                for (const name in this.graph) {
                    if (this.graph[name].boxName === this.focusedObject.name) {
                        this.graph[
                            name
                        ].floor = this.focusedObject.userData.floor
                    }
                }
            }
        }
    }

    changeBoxVisibility = () => {
        if (this.state.controls.moving || this.state.controls.boxFirstPoint) {
            for (const floor in this.box) {
                for (const room in this.box[floor]) {
                    this.box[floor][room].cubeObject.visible = true
                }
            }
            return
        } else if (!this.state.controls.addingBox && this.state.currentSphere) {
            for (const floor in this.box) {
                if (
                    this.planCamera.rotation.x < -Math.PI / 4 &&
                    floor > this.state.currentSphere.userData.floor
                ) {
                    //above
                    for (const room in this.box[floor]) {
                        this.box[floor][room].cubeObject.visible = false
                    }
                } else if (
                    this.planCamera.rotation.x > Math.PI / 4 &&
                    floor < this.state.currentSphere.userData.floor
                ) {
                    //below
                    for (const room in this.box[floor]) {
                        this.box[floor][room].cubeObject.visible = false
                    }
                } else {
                    for (const room in this.box[floor]) {
                        this.box[floor][room].cubeObject.visible = true
                    }
                }
            }
        }
    }

    addSticker = () => {
        this.raycaster.setFromCamera(this.mainMouse, this.mainCamera)
        const intersects = this.raycaster.intersectObjects(
            this.mainScene.children
        )
        if (intersects.length > 0 && intersects[0].object.name === 'sticker') {
            const sticker = intersects[0].object
            const pos = this.graph[
                this.state.currentSphere.name
            ].sticker.indexOf(sticker)
            this.graph[this.state.currentSphere.name].sticker.splice(pos, 1)
            this.mainScene.remove(sticker)
        } else if (this.state.currentSticker) {
            const normal = intersects[intersects.length - 1].point.normalize()
            const xzPlane = new THREE.Vector3(normal.x, 0, normal.z).normalize()
            const xyPlane = new THREE.Vector3(
                -1 + Math.abs(normal.y),
                normal.y,
                0
            )

            let xzAngle = Math.acos(xzPlane.dot(new THREE.Vector3(-1, 0, 0)))
            let xyAngle = Math.acos(xyPlane.dot(new THREE.Vector3(-1, 0, 0)))

            if (normal.z < 0) {
                xzAngle = -xzAngle
            }
            if (normal.y < 0) {
                xyAngle = -xyAngle
            }

            const geometry = new THREE.PlaneGeometry(25, 25)
            const texture = new THREE.TextureLoader().load(
                this.state.currentSticker
            )
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.FrontSide,
                transparent: true,
                alphaTest: 0.5
            })
            const sticker = new THREE.Mesh(geometry, material)
            sticker.position.copy(normal.multiplyScalar(450))
            sticker.rotateY(Math.PI / 2 + xzAngle)
            sticker.rotateX(xyAngle)
            sticker.name = 'sticker'
            sticker.userData.src = this.state.currentSticker
            this.mainScene.add(sticker)

            this.graph[this.state.currentSphere.name].sticker.push(sticker)
        }
    }

    addNewSticker = () => {
        const file = document.getElementById('stickerPath').files[0]
        if (!file.type.startsWith('image')) {
            alert('image only')
            return
        }
        const reader = new FileReader()
        reader.onload = e => {
            const stickerListCopy = this.state.stickerList
            if (stickerListCopy.length === 0) {
                this.setState({ currentSticker: e.target.result })
            }
            stickerListCopy.push(e.target.result)
            this.setState({ stickerList: stickerListCopy })
        }
        reader.readAsDataURL(file)
    }

    deleteSticker = () => {
        const stickerListCopy = this.state.stickerList
        const pos = stickerListCopy.indexOf(this.state.currentSticker)
        stickerListCopy.splice(pos, 1)
        this.setState({
            stickerList: stickerListCopy,
            currentSticker: stickerListCopy[0]
        })
    }

    getSticker = () => {
        if (this.state.controls.showSticker) {
            return this.state.stickerList.map((item, index) => {
                return (
                    <BottomButton
                        type="image"
                        key={index}
                        alt={item}
                        src={item}
                        select={item === this.state.currentSticker}
                        onClick={() => {
                            this.setState(state => ({
                                currentSticker: state.stickerList[index]
                            }))
                        }}
                    />
                )
            })
        } else {
            return
        }
    }

    getLayer = () => {
        const temp = []
        if (this.state.controls.showFront) {
            for (const name in this.graph[this.state.currentSphere.name].layer
                .front) {
                temp.push(name)
            }
            return temp.map((item, index) => {
                if (
                    this.graph[this.state.currentSphere.name].layer.front[
                        item
                    ].data.startsWith('data:image')
                ) {
                    return (
                        <BottomButton
                            type="image"
                            key={index}
                            alt={item}
                            src={
                                this.graph[this.state.currentSphere.name].layer
                                    .front[item].data
                            }
                            select={
                                this.state.layerList.front.indexOf(item) !== -1
                            }
                            onClick={() => {
                                this.toggleLayer('front', item)
                            }}
                        />
                    )
                } else if (
                    this.graph[this.state.currentSphere.name].layer.front[
                        item
                    ].data.startsWith('data:video')
                ) {
                    return (
                        <BottomVideo
                            key={index}
                            src={
                                this.graph[this.state.currentSphere.name].layer
                                    .front[item].data
                            }
                            select={
                                this.state.layerList.front.indexOf(item) !== -1
                            }
                            onClick={() => {
                                this.toggleLayer('front', item)
                            }}
                            autoPlay
                            muted
                            loop
                        />
                    )
                } else {
                    return null
                }
            })
        } else if (this.state.controls.showBack) {
            for (const name in this.graph[this.state.currentSphere.name].layer
                .back) {
                temp.push(name)
            }
            return temp.map((item, index) => {
                if (
                    this.graph[this.state.currentSphere.name].layer.back[
                        item
                    ].data.startsWith('data:image')
                ) {
                    return (
                        <BottomButton
                            type="image"
                            key={index}
                            alt={item}
                            src={
                                this.graph[this.state.currentSphere.name].layer
                                    .back[item].data
                            }
                            select={
                                this.state.layerList.back.indexOf(item) !== -1
                            }
                            onClick={() => {
                                this.toggleLayer('back', item)
                            }}
                        />
                    )
                } else if (
                    this.graph[this.state.currentSphere.name].layer.back[
                        item
                    ].data.startsWith('data:video')
                ) {
                    return (
                        <BottomVideo
                            key={index}
                            src={
                                this.graph[this.state.currentSphere.name].layer
                                    .back[item].data
                            }
                            select={
                                this.state.layerList.back.indexOf(item) !== -1
                            }
                            onClick={() => {
                                this.toggleLayer('back', item)
                            }}
                            autoPlay
                            muted
                            loop
                        />
                    )
                } else {
                    return null
                }
            })
        } else {
            return
        }
    }

    addNewLayer = type => {
        if (
            this.state.currentSphere &&
            document.getElementById('layerPath').files[0]
        ) {
            const file = document.getElementById('layerPath').files[0]
            const reader = new FileReader()
            const name = file.name
            if (
                !file.type.startsWith('image') &&
                !file.type.startsWith('video')
            ) {
                alert('unsupported format')
            } else {
                reader.onload = e => {
                    const color = `rgb(${
                        document.getElementById('red').value
                    }, ${document.getElementById('green').value}, ${
                        document.getElementById('blue').value
                    })`
                    const alpha = parseFloat(
                        document.getElementById('alpha').value
                    )
                    if (type === 'front') {
                        this.graph[this.state.currentSphere.name].layer.front[
                            name
                        ] = {
                            data: e.target.result,
                            used: -1,
                            color: color,
                            alpha: alpha
                        }
                    } else if (type === 'back') {
                        this.graph[this.state.currentSphere.name].layer.back[
                            name
                        ] = {
                            data: e.target.result,
                            used: -1,
                            color: color,
                            alpha: alpha
                        }
                    }
                    document.getElementById('layerPath').value = ''
                    document.getElementById('red').value = ''
                    document.getElementById('green').value = ''
                    document.getElementById('blue').value = ''
                    document.getElementById('alpha').value = ''

                    this.setState(state => ({ reload: !state.reload }))
                }
                reader.readAsDataURL(file)
            }
        } else {
            alert('sphere or file is missing')
        }
    }

    deleteLayer = () => {
        if (this.state.controls.showFront) {
            const temp = []
            for (const name in this.graph[this.state.currentSphere.name].layer
                .front) {
                if (
                    this.graph[this.state.currentSphere.name].layer.front[name]
                        .used !== -1
                ) {
                    temp.push(name)
                    this.toggleLayer('front', name)
                }
            }
            for (const item of temp) {
                delete this.graph[this.state.currentSphere.name].layer.front[
                    item
                ]
            }
        } else if (this.state.controls.showBack) {
            const temp = []
            for (const name in this.graph[this.state.currentSphere.name].layer
                .back) {
                if (
                    this.graph[this.state.currentSphere.name].layer.back[name]
                        .used !== -1
                ) {
                    temp.push(name)
                    this.toggleLayer('back', name)
                }
            }
            for (const item of temp) {
                delete this.graph[this.state.currentSphere.name].layer.back[
                    item
                ]
            }
        }
        this.setState(state => ({ reload: !state.reload }))
    }

    toggleLayer = (type, name) => {
        const layerListCopy = { ...this.state.layerList }
        const length = this.state.layerList[type].length
        const pos = this.state.layerList[type].indexOf(name)
        if (pos === -1) {
            // close -> open
            const item = this.graph[this.state.currentSphere.name].layer[type][
                name
            ]
            const geometry = new THREE.SphereGeometry(1, 32, 32)
            let material
            if (item.data.startsWith('data:image')) {
                const texture = new THREE.TextureLoader().load(item.data)
                texture.wrapS = THREE.RepeatWrapping
                texture.repeat.x = -1
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide,
                    transparent: true,
                    alphaTest: 0.5
                })
            } else if (item.data.startsWith('data:video')) {
                material = new THREEx.ChromaKeyMaterial(
                    item.data,
                    item.color,
                    item.alpha
                )
                material.side = THREE.BackSide
                material.transparent = true
                const videoList = [...this.state.videoList, material]
                this.setState({
                    videoList: videoList
                })
            }
            const sphere = new THREE.Mesh(geometry, material)
            if (type === 'front') {
                sphere.scale.setScalar(500 - 1 - length)
            } else if (type === 'back') {
                sphere.scale.setScalar(700 + length)
            }
            sphere.name = `sphere#${type}#${name}`
            this.mainScene.add(sphere)
            this.graph[this.state.currentSphere.name].layer[type][
                name
            ].used = length
            layerListCopy[type].push(name)
        } else {
            //open -> close
            const after = this.state.layerList[type].slice(pos + 1)
            let removeObj
            for (const obj of this.mainScene.children) {
                if (obj.name === `sphere#${type}#${name}`) {
                    removeObj = obj
                } else if (after.indexOf(obj.name.split('#')[2]) !== -1) {
                    const scale = obj.scale
                    if (type === 'front') {
                        obj.scale.setScalar(scale.x + 1)
                    } else if (type === 'back') {
                        obj.scale.setScalar(scale.x - 1)
                    }
                }
            }
            this.mainScene.remove(removeObj)
            layerListCopy[type].splice(pos, 1)
            this.graph[this.state.currentSphere.name].layer[type][
                name
            ].used = -1
        }
        this.setState({ layerList: layerListCopy })
    }

    removeLayerChangeScene = () => {
        const layerListCopy = { ...this.state.layerList }
        let temp = []
        for (const obj of this.mainScene.children) {
            if (obj.name.startsWith('sphere#')) {
                temp.push(obj)
            }
        }
        for (const item of temp) {
            this.mainScene.remove(item)
        }
        layerListCopy.front = []
        layerListCopy.back = []
        this.setState({ layerList: layerListCopy })
    }

    addLayerChangeScene = (type, layer) => {
        const layerListCopy = { ...this.state.layerList }
        for (const name in layer) {
            if (layer[name].used !== -1) {
                const geometry = new THREE.SphereGeometry(1, 32, 32)
                let material
                if (layer[name].data.startsWith('data:image')) {
                    const texture = new THREE.TextureLoader().load(
                        layer[name].data
                    )
                    texture.wrapS = THREE.RepeatWrapping
                    texture.repeat.x = -1
                    material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.BackSide,
                        transparent: true,
                        alphaTest: 0.7
                    })
                } else if (layer[name].data.startsWith('data:video')) {
                    material = new THREEx.ChromaKeyMaterial(
                        layer[name].data,
                        layer[name].color,
                        layer[name].alpha
                    )
                    material.side = THREE.BackSide
                    material.transparent = true
                    const videoList = [...this.state.videoList, material]
                    this.setState({
                        videoList: videoList
                    })
                }
                const sphere = new THREE.Mesh(geometry, material)
                if (type === 'front') {
                    sphere.scale.setScalar(500 - 1 - layer[name].used)
                } else if (type === 'back') {
                    sphere.scale.setScalar(700 + layer[name].used)
                }
                sphere.name = `sphere#${type}#${name}`
                this.mainScene.add(sphere)
                layerListCopy[type].push(name)
            }
        }
        this.setState({ layerList: layerListCopy })
    }

    addingPoint = () => {
        const controlsCopy = { ...this.state.controls }
        controlsCopy.addingPoint = true
        this.setState({ controls: controlsCopy })
    }

    deletePoint = () => {
        const controlsCopy = { ...this.state.controls }
        controlsCopy.deletePoint = true
        this.setState({ controls: controlsCopy })
    }

    showPlan = () => {
        const controlsCopy = { ...this.state.controls }
        controlsCopy.showPlan = !this.state.controls.showPlan
        this.setState({ controls: controlsCopy }, this.resizeWindow)
    }

    showMap = () => {
        const controlsCopy = { ...this.state.controls }
        controlsCopy.showMap = !this.state.controls.showMap
        this.setState({ controls: controlsCopy }, this.resizeWindow)
        if (controlsCopy.showMap) {
            document
                .getElementById('shader')
                .addEventListener('click', this.showMap)
            document
                .getElementById('menu')
                .addEventListener('click', this.showMap)
        } else {
            document
                .getElementById('shader')
                .removeEventListener('click', this.showMap)
            document
                .getElementById('menu')
                .removeEventListener('click', this.showMap)
        }
    }

    showHelp = () => {
        const controlsCopy = { ...this.state.controls }
        controlsCopy.showHelp = !this.state.controls.showHelp
        this.setState({ controls: controlsCopy }, this.resizeWindow)
        if (controlsCopy.showHelp) {
            document
                .getElementById('shader')
                .addEventListener('click', this.showHelp)
            document
                .getElementById('menu')
                .addEventListener('click', this.showHelp)
        } else {
            document
                .getElementById('shader')
                .removeEventListener('click', this.showHelp)
            document
                .getElementById('menu')
                .removeEventListener('click', this.showHelp)
        }
    }

    showBottom = type => {
        const controlsCopy = { ...this.state.controls }
        if (type === 'sticker') {
            controlsCopy.showSticker = !this.state.controls.showSticker
            controlsCopy.showFront = false
            controlsCopy.showBack = false
        } else if (type === 'front') {
            controlsCopy.showSticker = false
            controlsCopy.showFront = !this.state.controls.showFront
            controlsCopy.showBack = false
        } else if (type === 'back') {
            controlsCopy.showSticker = false
            controlsCopy.showFront = false
            controlsCopy.showBack = !this.state.controls.showBack
        } else {
            controlsCopy.showSticker = false
            controlsCopy.showFront = false
            controlsCopy.showBack = false
        }

        this.setState({ controls: controlsCopy }, this.resizeWindow)
        if (
            controlsCopy.showSticker ||
            controlsCopy.showFront ||
            controlsCopy.showBack
        ) {
            document
                .getElementById('plan')
                .addEventListener('click', this.showBottom)
            document
                .getElementById('canvas')
                .addEventListener('click', this.showBottom)
            document
                .getElementById('menu')
                .addEventListener('click', this.showBottom)
        } else {
            document
                .getElementById('plan')
                .removeEventListener('click', this.showBottom)
            document
                .getElementById('canvas')
                .removeEventListener('click', this.showBottom)
            document
                .getElementById('menu')
                .removeEventListener('click', this.showBottom)
        }
    }

    changeState = state => {
        if (state === 'url') {
            this.setState(
                {
                    websiteLink: document.getElementById('url').value
                },
                () => {
                    document.getElementById('url').value = ''
                }
            )
        } else if (state === 'lat') {
            this.setState(
                {
                    latitude: Number(document.getElementById('latitude').value)
                },
                () => {
                    document.getElementById('latitude').value = ''
                }
            )
        } else if (state === 'long') {
            this.setState(
                {
                    longtitude: Number(
                        document.getElementById('longtitude').value
                    )
                },
                () => {
                    document.getElementById('longtitude').value = ''
                }
            )
        }
    }

    render = () => {
        if (!this.state.loading) {
            return (
                <MainDiv id="mainDiv" controls={this.state.controls}>
                    <CanvasDiv id="canvasDiv" env={this.state.env}>
                        <MainView
                            scene={this.mainScene}
                            camera={this.mainCamera}
                            renderer={this.mainRenderer}
                            orbitControls={this.mainControls}
                            mouse={this.mainMouse}
                            raycaster={this.raycaster}
                            state={this.state.mainState}
                            graph={this.graph}
                            box={this.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                            mouseDown={this.onCanvasMouseDown}
                            doubleClick={this.onCanvasDoubleClick}
                            videoList={this.state.videoList}
                        />
                        <PlanView
                            scene={this.planScene}
                            camera={this.planCamera}
                            renderer={this.planRenderer}
                            orbitControls={this.planControls}
                            mouse={this.planMouse}
                            raycaster={this.raycaster}
                            state={this.state.planState}
                            graph={this.graph}
                            box={this.box}
                            startingPoint={this.state.startingPoint}
                            controls={this.state.controls}
                            mouseDown={this.onPlanMouseDown}
                            mouseUp={this.onPlanMouseUp}
                            doubleClick={this.onPlanDoubleClick}
                        />
                        <Bottomtab
                            showSticker={this.state.controls.showSticker}
                            showFront={this.state.controls.showFront}
                            showBack={this.state.controls.showBack}
                            getSticker={this.getSticker}
                            getLayer={this.getLayer}
                        />
                        {!this.state.controls.moving &&
                            !this.state.controls.addingBox &&
                            !this.state.controls.boxFirstPoint && (
                                <DropDown
                                    graph={this.graph}
                                    changeScene={this.changeScene}
                                />
                            )}
                        {!this.state.controls.moving &&
                            !this.state.controls.addingBox &&
                            !this.state.controls.boxFirstPoint && (
                                <Menu
                                    canOpen={
                                        !this.state.controls.addingBox &&
                                        !this.state.controls.moving
                                    }
                                    showPlan={this.showPlan}
                                    showMap={this.showMap}
                                    showSticker={() => {
                                        this.showBottom('sticker')
                                    }}
                                    showFront={() => {
                                        this.showBottom('front')
                                    }}
                                    showBack={() => {
                                        this.showBottom('back')
                                    }}
                                    showHelp={this.showHelp}
                                    websiteLink={this.state.websiteLink}
                                />
                            )}

                        <Shader
                            show={
                                this.state.controls.showMap ||
                                this.state.controls.showHelp
                            }
                            id="shader"
                        />
                        <Map
                            show={this.state.controls.showMap}
                            latitude={this.state.latitude}
                            longtitude={this.state.longtitude}
                        />
                        <Help show={this.state.controls.showHelp} />
                    </CanvasDiv>

                    {this.state.env === 'dev' && (
                        <DevTab
                            controls={this.state.controls}
                            addPoint={this.addingPoint}
                            addSticker={this.addNewSticker}
                            deletePoint={this.deletePoint}
                            deleteSticker={this.deleteSticker}
                            addBox={this.addBox}
                            createBox={this.createBox}
                            moveBox={this.moveBox}
                            saveState={this.saveState}
                            addLayer={this.addNewLayer}
                            deleteLayer={this.deleteLayer}
                            changeState={this.changeState}
                        />
                    )}
                </MainDiv>
            )
        } else {
            return (
                <LoadingDiv>
                    <FontAwesomeIcon
                        icon={faSpinner}
                        size="lg"
                        pulse
                        style={{
                            margin: 'auto'
                        }}
                    />
                </LoadingDiv>
            )
        }
    }
}

export default App
