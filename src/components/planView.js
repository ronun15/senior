import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

const FlexDiv = styled.div`
    display: flex;
`

class planView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            click: 0
        }
    }

    componentDidMount() {
        const graph = this.props.graph
        const box = this.props.box
        const startingPoint = this.props.startingPoint
        const controlsState = this.props.controls

        const camera = this.props.state.camera

        const renderer = this.props.state.renderer
        renderer.setSize(this.props.state.width, this.props.state.height)
        renderer.domElement.id = 'plan'

        // sphereElement = []
        // stickerList = []

        const controls = this.props.state.controls
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

        this.scene = this.props.state.scene
        this.camera = this.props.state.camera
        this.renderer = this.props.state.renderer
        this.controls = this.props.state.controls
        this.mouse = this.props.state.mouse
        this.raycaster = this.props.state.raycaster

        this.mount.appendChild(this.renderer.domElement)
        this.start()

        document
            .getElementById('plan')
            .addEventListener('mousemove', this.onMouseMove)
    }

    componentWillUnmount = () => {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {
        this.updateComponent()
        this.frameId = window.requestAnimationFrame(this.animate)
        this.renderer.render(this.scene, this.camera)
    }

    updateComponent = () => {
        const aspect = this.props.state.width / this.props.state.height
        if (aspect !== this.camera.aspect) {
            this.camera.aspect = aspect
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(
                this.props.state.width,
                this.props.state.height,
                true
            )
        }
        this.controls.update()
        if (this.props.controls.moving) {
            this.controls.maxPolarAngle = Math.PI / 2 - 0.1
        } else {
            this.controls.maxPolarAngle = Math.PI
        }
    }

    onMouseMov = event => {
        this.mouse.x =
            (event.clientX / document.getElementById('plan').clientWidth) * 2 -
            1
        this.mouse.y =
            ((document.body.clientHeight - event.clientY) /
                document.getElementById('plan').clientHeight) *
                2 -
            1
    }

    render = () => {
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
