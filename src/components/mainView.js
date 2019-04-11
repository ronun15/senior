import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

import OrbitControls from '../lib/orbitControls'

const FlexDiv = styled.div`
    display: flex;
    transition: width 2s, height 2s;
`

class mainView extends Component {
    constructor(props) {
        super(props)

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
        this.updateComponent = this.updateComponent.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    componentDidMount() {
        //setup
        const mainState = this.props.mainState
        const graph = this.props.graph
        const box = this.props.box
        const startingPoint = this.props.startingPoint
        const controlsState = this.props.controls

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            75,
            mainState.width / mainState.height,
            0.1,
            1000
        )
        camera.position.set(0, 0, 0)

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(mainState.width, mainState.height)
        renderer.domElement.id = 'canvas'

        // sphereElement = []
        // stickerList = []

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.5
        controls.enableKeys = false
        controls.enableZoom = false
        controls.rotateSpeed = 0.5
        controls.minDistance = 10
        controls.target = new THREE.Vector3(-10, 0, 0)

        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        const geometry = new THREE.SphereGeometry(500, 32, 32)
        const texture = new THREE.TextureLoader().load(startingPoint)
        texture.wrapS = THREE.RepeatWrapping
        texture.repeat.x = -1
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = startingPoint
        sphere.floor = 2
        scene.add(sphere)

        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.controls = controls
        this.mouse = mouse
        this.raycaster = raycaster

        this.mount.appendChild(this.renderer.domElement)
        this.start()

        document
            .getElementById('canvas')
            .addEventListener('mousemove', this.onMouseMove)
    }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.updateComponent()
        this.frameId = window.requestAnimationFrame(this.animate)
        this.renderer.render(this.scene, this.camera)
    }

    updateComponent() {
        const aspect = this.props.mainState.width / this.props.mainState.height
        if (aspect !== this.camera.aspect) {
            this.camera.aspect = aspect
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(
                this.props.mainState.width,
                this.props.mainState.height,
                true
            )
        }
        this.controls.update()
    }

    onMouseMove(event) {
        // console.log('main mouse')
        // this.mouse.x = (event.clientX / document.getElementById('canvas').clientWidth) * 2 - 1
        // this.mouse.y = -(event.clientY / document.getElementById('canvas').clientHeight) * 2 + 1
    }

    render() {
        return (
            <FlexDiv
                ref={mount => {
                    this.mount = mount
                }}
            />
        )
    }
}

export default mainView
