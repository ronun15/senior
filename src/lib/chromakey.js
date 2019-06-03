import * as THREE from 'three'
const THREEx = {}

THREEx.ChromaKeyMaterial = function(url, color, alpha) {
    THREE.ShaderMaterial.call(this)
    const video = document.createElement('video')
    video.src = url
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.setAttribute('webkit-playsinline', 'webkit-playsinline')
    video.play()

    var keyColorObject = new THREE.Color(color)

    var videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.wrapS = THREE.ClampToEdgeWrapping
    videoTexture.wrapT = THREE.ClampToEdgeWrapping
    videoTexture.repeat.x = -1

    this.stopVideo = function() {
        video.pause()
        video.src = ''
    }

    this.update = function() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // videoImageContext.drawImage(video, 0, 0);
            if (videoTexture) {
                videoTexture.needsUpdate = true
            }
        }
    }

    this.setValues({
        uniforms: {
            texture: {
                type: 't',
                value: videoTexture
            },
            color: {
                type: 'c',
                value: keyColorObject
            },
            alpha: {
                value: alpha
            }
        },
        vertexShader:
            'varying mediump vec2 vUv;\n' +
            'void main(void)\n' +
            '{\n' +
            'vUv = vec2(1.0 - uv.x, uv.y);\n' +
            'mediump vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n' +
            'gl_Position = projectionMatrix * mvPosition;\n' +
            '}',
        fragmentShader:
            'uniform mediump sampler2D texture;\n' +
            'uniform mediump vec3 color;\n' +
            'uniform mediump float alpha;\n' +
            'varying mediump vec2 vUv;\n' +
            'void main(void)\n' +
            '{\n' +
            '  mediump vec3 tColor = texture2D( texture, vUv ).rgb;\n' +
            '  mediump float a = (length(tColor - color) - 0.5) * 7.0;\n' +
            '  if(a<0.0) discard;\n' +
            '  gl_FragColor = vec4(tColor, min(a,1.0) * alpha);\n' +
            '}',
        transparent: true
    })
}

THREEx.ChromaKeyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype)

export default THREEx
