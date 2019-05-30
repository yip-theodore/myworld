import * as THREE from 'three'
import { lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)

const axesHelper = new THREE.AxesHelper(20)
scene.add( axesHelper )


const length = 2
const geometry = new THREE.BufferGeometry()

const positions = new THREE.BufferAttribute(new Float32Array(length ** 3 * 3), 3)
geometry.addAttribute('position', positions)

for (let i = 0; i < length; i++) {
  for (let j = 0; j < length; j++) {
    for (let k = 0; k < length; k++) {
      // console.log(i, j, k)
      // console.log('*', i * length ** 2 + j * length + k)
      positions.setXYZ(
        i * length ** 2 + j * length + k,
        i,
        j,
        k
      )
    }
  }
}
// console.log(positions)


const vertexShader = glsl(/* glsl */`
  precision highp float;

  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 6.0;
  }
`)
const fragmentShader = glsl(/* glsl */`
  precision highp float;

  void main () {
    gl_FragColor = vec4(vec3(0.0), 0.5);
  }
`)

const material = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  depthTest: false,
  transparent: true
})

const object = new THREE.Points(geometry, material)
scene.add(object)


camera.position.z = 10
scene.position.y = -5

const clock = new THREE.Clock()
const animate = () => {

  scene.rotation.y += 0.01

  // material.uniforms.time.value = clock.getElapsedTime()
  
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
