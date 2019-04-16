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
        const box = this.props.box
        const startingPoint = this.props.startingPoint
        const controlsState = this.props.controls

        const scene = this.props.state.scene
        const camera = this.props.state.camera
        camera.position.set(0, 0, 0)

        const renderer = this.props.state.renderer
        renderer.setSize(this.props.state.width, this.props.state.height)
        renderer.domElement.id = 'canvas'

        // stickerList = []

        const controls = this.props.state.controls
        controls.enableDamping = true
        controls.dampingFactor = 0.5
        controls.enableKeys = false
        controls.enableZoom = false
        controls.rotateSpeed = 0.5
        controls.minDistance = 10
        controls.target = new THREE.Vector3(-10, 0, 0)

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
        sphere.floor = 2
        scene.add(sphere)

        this.scene = this.props.state.scene
        this.camera = this.props.state.camera
        this.renderer = this.props.state.renderer
        this.controls = this.props.state.controls
        this.mouse = this.props.state.mouse
        this.raycaster = this.props.state.raycaster

        this.mount.appendChild(this.renderer.domElement)
        this.start()

        document
            .getElementById('canvas')
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
    }

    onMouseMove = event => {
        this.mouse.x =
            (event.clientX / document.getElementById('canvas').clientWidth) *
                2 -
            1
        this.mouse.y =
            -(event.clientY / document.getElementById('canvas').clientHeight) *
                2 +
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

export default mainView
