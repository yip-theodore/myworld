import * as THREE from 'three'
import { lerp, clamp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('black')
document.body.appendChild(renderer.domElement)

// const axesHelper = new THREE.AxesHelper(20)
// scene.add( axesHelper )


const length = 10
const span = 100
const geometry = new THREE.BufferGeometry()

const uvs = new THREE.BufferAttribute(new Float32Array(length ** 3 * 3), 3)
geometry.addAttribute('uv', uvs)
const positions = new THREE.BufferAttribute(new Float32Array(length ** 3 * 3), 3)
geometry.addAttribute('position', positions)

for (let i = 0; i < length; i++) {
  for (let j = 0; j < length; j++) {
    for (let k = 0; k < length; k++) {

      const index = i * length ** 2 + j * length + k

      const uv = [
        i / (length - 1),
        j / (length - 1),
        k / (length - 1)
      ]

      uvs.setXYZ(index, ...uv)
      positions.setXYZ(
        index,
        ...uv.map(coord => lerp(-span / 2, span / 2, coord))
      )
    }
  }
}

const vertexShader = glsl(/* glsl */`
  precision highp float;

  attribute vec3 uv;
  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec3 cameraPosition;

  uniform float time;

  varying vec3 vUv;
  varying vec3 vPosition;
  varying float vTime;

  void main() {
    vUv = uv;
    vPosition = position;
    vTime = time;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);;
    gl_PointSize = 1000.0 / length(cameraPosition - position);
  }
`)
const fragmentShader = glsl(/* glsl */`
  precision highp float;

  varying vec3 vUv;
  varying vec3 vPosition;
  varying float vTime;

  float map (float value, float min1, float max1, float min2, float max2) {
    // Convert the current value to a percentage // 0% - min1, 100% - max1
    float perc = (value - min1) / (max1 - min1);
    // Do the same operation backwards with min2 and max2
    return perc * (max2 - min2) + min2;
  }

  void main () {

    vec3 color = vec3(
      mod(floor(vUv.y * 10.0), 2.0) > 0.0 ? 0.0 : 0.2,
      mod(floor(vUv.y * 10.0), 2.0) > 0.0 ? 0.2 : 0.0,
      mod(floor(vUv.y * 10.0), 2.0) > 0.0 ? 1.0 : 1.0
    );

      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
    float alpha = smoothstep(0.2, 0.0, dist);

      float time = vTime * 0.2;
      float fTime = (time - floor(time)) * 3.0 - 1.0;
      float dist2 = length(fTime - vUv.x);
      float scalar = map(dist2, 0.0, 0.8, 2.0, 0.0);
    float opacity = clamp(scalar, 0.2, 5.0);

    gl_FragColor = vec4(color, alpha * opacity);
  }
`)

const material = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 0 },
    origin: { value: new THREE.Vector3() },
  },
  vertexShader,
  fragmentShader,
  depthTest: false,
  transparent: true,
  blending: THREE.AdditiveBlending
})

const object = new THREE.Points(geometry, material)
scene.add(object)


camera.position.z = 10
const offset = { x: 0, y: 0, z: 0 }

const clock = new THREE.Clock()
const animate = () => {

  // object.rotation.y += 0.01
  camera.position.x = offset.x
  camera.position.y = offset.y
  material.uniforms.time.value = clock.getElapsedTime()
  
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


window.addEventListener('mousemove', ({ clientX, clientY }) => {
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  offset.x = (center.x - clientX) * 0.1
  offset.y = -(center.y - clientY) * 0.1
})


export { scene, camera, renderer }
