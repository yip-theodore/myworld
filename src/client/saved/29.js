import * as THREE from 'three'
import { linspace, lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.y = 5
camera.rotation.x = - Math.PI / 2

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)


const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 5, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);




const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 'grey'
})

// const points = linspace(20, true).map(v => (
//   linspace(20, true).map(u => [u, v])
// ))
const length = 40
const span = 10

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

  mesh.scale.setScalar(0.05)
  meshes.push(mesh)
})

const container = new THREE.Group()
meshes.forEach(mesh => container.add(mesh))
container.position.set(-span / 2, 0, span / 4)
container.rotation.x = Math.PI / 2 + 1
scene.add(container)

console.log(random.noise4D(0, 0, 0, 0))

let count = 0
const animate = () => {

  meshes.forEach(mesh => {
    const { x, y, z } = mesh.originalPosition
    const ny = random.noise4D(x, y, z, count, 0.2)
    // mesh.position.x = x + transform
    mesh.position.y = y + ny
  })

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 0.01
}
animate()


export { scene, camera, renderer }
