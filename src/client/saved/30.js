import * as THREE from 'three'
import { linspace, lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
import BezierEasing from 'bezier-easing'

import * as Stats from './assets/stats'
const stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


random.setSeed(4)
console.log(random.getSeed())
const length = 200
const span = 50

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, span)
camera.position.y = -5
camera.rotation.x = - Math.PI / 2

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('#222');
document.body.appendChild(renderer.domElement)


// scene.fog = new THREE.Fog('white', 0.1, span)


const geometry = new THREE.SphereGeometry(0.01, 8, 8)
const material = new THREE.MeshBasicMaterial({
  color: 'white',
  transparent: true,
  opacity: 0.5
})

const points = []
for (let i = 0; i < length; i++) {
  for (let j = 0; j < length; j++) {
    const u = i / (length - 1)
    const v = j / (length - 1)
    points.push([ u, v ])
  }
}


const meshes = []
points.forEach(([ u, v ]) => {
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.x = lerp(0, span, u)
  mesh.position.z = lerp(0, span, v)
  
  mesh.originalPosition = mesh.position.clone()

  const ny = random.noise4D(
    mesh.originalPosition.x / 4,
    mesh.originalPosition.y,
    mesh.originalPosition.z,
    0,
    0.25, 1
  )
  const nyy = random.noise4D(
    mesh.originalPosition.x / 4,
    mesh.originalPosition.y,
    mesh.originalPosition.z,
    1,
    0.05, 4
  )
  mesh.position.y = mesh.originalPosition.y + ny + nyy

  meshes.push(mesh)
})

const container = new THREE.Group()
meshes.forEach(mesh => container.add(mesh))

container.position.set(-span / 2, 0, span / 4)
container.rotation.x = Math.PI / 2 + 1
scene.add(container)


const ease = BezierEasing(0, 0.5, 0, 1)

let count = 0
const animate = () => {
  stats.begin()

  camera.rotation.x += ease(count) * 0.001
  camera.position.y += ease(count) * 0.005
  camera.position.z += ease(count) * 0.0075

  renderer.render( scene, camera )


  stats.end();
  requestAnimationFrame(animate)
  count += 0.001
}
animate()


export { scene, camera, renderer }
