import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

const FlexDiv = styled.div`
    display: flex;
`

class planView extends Component {
    componentDidMount() {
        const graph = this.props.graph
        const startingPoint = this.props.startingPoint

        const camera = this.props.camera

        const renderer = this.props.renderer
        renderer.setSize(this.props.state.width, this.props.state.height)
        renderer.domElement.id = 'plan'

        // sphereElement = []
        // stickerList = []

        const controls = this.props.orbitControls
        controls.enableDamping = true
        controls.enableKeys = false
        controls.enableZoom = true
        controls.minDistance = 1
        controls.maxDistance = 20

        if (startingPoint) {
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
        } else {
            camera.position.set(0, 7, 0)
            camera.lookAt(0, 0, 0)
            controls.target.set(0, 0, 0)
        }

        this.scene = this.props.scene
        this.camera = this.props.camera
        this.renderer = this.props.renderer
        this.controls = this.props.orbitControls
        this.mouse = this.props.mouse
        this.raycaster = this.props.raycaster

        this.mount.appendChild(this.renderer.domElement)
        this.start()
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

    render = () => {
        return (
            <FlexDiv
                ref={mount => {
                    this.mount = mount
                }}
                onMouseDown={this.props.mouseDown}
                onMouseUp={this.props.mouseUp}
                onDoubleClick={this.props.doubleClick}
            />
        )
    }
}

export default planView
