import React, { Component } from 'react'
import * as THREE from 'three'

class mainView extends Component {
    constructor(props) {
        super(props)

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    componentDidMount() {
        //setup
        const { width, height } = this.props

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.set(0, 0, 0)

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(width, height)
        renderer.domElement.id = 'canvas'

        // sphereElement = []

        // const controls = new OrbitControls(camera, renderer.domElement)
        // controls.enableDamping = true
        // controls.dampingFactor = 0.5
        // controls.enableKeys = false
        // controls.enableZoom = false
        // controls.rotateSpeed = 0.5
        // controls.minDistance = 10
        // controls.target = new THREE.Vector3(-10, 0, 0)

        const mouse = new THREE.Vector2()
        const lastMousePosition = new THREE.Vector2()

        //demo
        const startingPointName = './360.jpg'
        const geometry = new THREE.SphereGeometry(500, 32, 32)
        const texture = new THREE.TextureLoader().load(startingPointName)
        texture.wrapS = THREE.RepeatWrapping
        texture.repeat.x = -1
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = startingPointName
        sphere.floor = 2
        scene.add(sphere)

        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        // this.controls = controls
        this.mouse = mouse
        this.lastMousePosition = lastMousePosition

        this.mount.appendChild(this.renderer.domElement)
        this.start()
    }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }

    animate() {
        this.frameId = window.requestAnimationFrame(this.animate)
        this.renderer.render(this.scene, this.camera)
    }

    render() {
        return (
            <div
                ref={mount => {
                    this.mount = mount
                }}
            />
        )
    }
}

export default mainView
