import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

import OrbitControls from '../lib/orbitControls'

const FlexDiv = styled.div`
    display: flex;
`

class planView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            click: 0
        }

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
        this.updateComponent = this.updateComponent.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    componentDidMount() {
        const planState = this.props.planState
        const graph = this.props.graph
        const box = this.props.box
        const startingPoint = this.props.startingPoint
        const controlsState = this.props.controls

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            75,
            planState.width / planState.height,
            0.1,
            1000
        )

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(planState.width, planState.height)
        renderer.domElement.id = 'plan'

        // sphereElement = []
        // stickerList = []

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enableKeys = false
        controls.enableZoom = true
        controls.minDistance = 1
        controls.maxDistance = 20

        camera.position.set(
            graph[startingPoint].pos.x,
            graph[startingPoint].pos.y + 7,
            graph[startingPoint].pos.z
        )
        camera.lookAt(
            graph[startingPoint].pos.x,
            graph[startingPoint].pos.y,
            graph[startingPoint].pos.z
        )
        controls.target.set(
            graph[startingPoint].pos.x,
            graph[startingPoint].pos.y,
            graph[startingPoint].pos.z
        )

        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.controls = controls
        this.mouse = mouse
        this.raycaster = raycaster

        this.mount.appendChild(this.renderer.domElement)
        this.start()

        document
            .getElementById('plan')
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
        const aspect = this.props.planState.width / this.props.planState.height
        if (aspect !== this.camera.aspect) {
            this.camera.aspect = aspect
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(
                this.props.planState.width,
                this.props.planState.height,
                true
            )
        }
        this.controls.update()
    }

    onMouseMove(event) {
        // console.log('plan mouse')
        // this.planMouse.x = (event.clientX / document.getElementById('bottomLeft').clientWidth) * 2 - 1
        // this.planMouse.y = ((document.body.clientHeight - event.clientY) / document.getElementById('bottomLeft').clientHeight) * 2 - 1
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

export default planView
