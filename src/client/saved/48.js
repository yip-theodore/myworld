import * as THREE from 'three'
import { lerp, clamp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')
import * as Stats from './assets/stats'

const { cos, sin, PI } = Math
const toRad = angle => angle * PI / 180


const stats = new Stats()
stats.showPanel(0)
document.body.appendChild( stats.dom );

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('yellow')
document.body.appendChild(renderer.domElement)

// const axesHelper = new THREE.AxesHelper(20)
// scene.add( axesHelper )


const positions = []

for (let i = 0; i < 2*PI; i+=PI/36) {
  const o = 2 / ( 3 - cos(2*i)) * 10
  positions.push(
    o * cos(i),
    o * sin(2*i)/2,
    0
  )
}


const geometry = new THREE.BufferGeometry()
geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
console.log(geometry)

const material = new THREE.LineBasicMaterial()


const loop = new THREE.Line(geometry, material)
scene.add(loop)


const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(),
  new THREE.MeshBasicMaterial()
)
scene.add(sphere)


function getPosition (i) {
  const o = 2 / ( 3 - cos(2*i)) * 10
  return [
    o * cos(i),
    o * sin(2*i)/2,
    0
  ]
}






camera.position.set(-10, -10, 20)
camera.lookAt(0, 0, 0)

let count = 0
const animate = () => {
  stats.begin()

  sphere.position.set(
    ...getPosition(count * 0.02)
  )
  
  count += 1
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  stats.end()
}
animate()


export { scene, camera, renderer }
