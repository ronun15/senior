import React, { Component } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'

const FlexDiv = styled.div`
    display: flex;
    transition: width 2s, height 2s;
`

class mainView extends Component {
    componentDidMount = () => {
        //setup
        const graph = this.props.graph
        const startingPoint = this.props.startingPoint

        const scene = this.props.scene
        const camera = this.props.camera
        camera.position.set(0, 0, 0)

        const renderer = this.props.renderer
        renderer.setSize(this.props.state.width, this.props.state.height)
        renderer.domElement.id = 'canvas'
        renderer.domElement.addEventListener('wheel', this.updateFOV)

        const controls = this.props.orbitControls
        controls.enableDamping = true
        controls.dampingFactor = 0.5
        controls.enableKeys = false
        controls.enableZoom = false
        controls.enablePan = false
        controls.rotateSpeed = 0.5
        controls.minDistance = 1
        controls.maxDistance = 100
        controls.target = new THREE.Vector3(-10, 0, 0)

        if (startingPoint) {
            const geometry = new THREE.SphereGeometry(500, 32, 32)
            const texture = new THREE.TextureLoader().load(
                graph[startingPoint].path
            )
            texture.wrapS = THREE.RepeatWrapping
            texture.repeat.x = -1
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            })
            const sphere = new THREE.Mesh(geometry, material)
            sphere.name = graph[startingPoint].name
            sphere.floor = graph[startingPoint].floor
            scene.add(sphere)
        }

        this.scene = this.props.scene
        this.camera = this.props.camera
        this.renderer = this.props.renderer
        this.controls = this.props.orbitControls
        this.mouse = this.props.mouse
        this.raycaster = this.props.raycaster
        this.defaultFOV = (55 * Math.PI) / 180
        this.zoomSpeed = 0.03
        this.zoomFactor = 1

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
    }

    updateFOV = e => {
        let newZoomFactor
        if (e.deltaY > 0) {
            newZoomFactor = this.zoomFactor - this.zoomSpeed
        } else if (e.deltaY < 0) {
            newZoomFactor = this.zoomFactor + this.zoomSpeed
        }
        const fovRad = Math.atan(Math.tan(this.defaultFOV) / newZoomFactor)
        if (fovRad > 0) {
            this.camera.fov = (fovRad / Math.PI) * 180
            this.zoomFactor = newZoomFactor
        }

        this.camera.updateProjectionMatrix()
    }

    render = () => {
        return (
            <FlexDiv
                ref={mount => {
                    this.mount = mount
                }}
                onMouseDown={this.props.mouseDown}
                onDoubleClick={this.props.doubleClick}
            />
        )
    }
}

export default mainView
