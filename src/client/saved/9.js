import * as THREE from 'three'

import random from 'canvas-sketch-util/random'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({
  color: 'white',
  metalness: 0,
  roughness: 1
})

const meshes = []
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = i
    mesh.position.y = j
    mesh.rotation.set(i, 1, j)
    mesh.scale.setScalar(0.5)
    

    mesh.direction = random.gaussian()

    meshes.push(mesh)
  }
}
const container = new THREE.Group()
container.position.set(-1.5, -1.5, 0)
meshes.forEach(mesh => container.add(mesh))
scene.add(container)


const light = new THREE.DirectionalLight('white', 1);
light.position.set(0, 1, 2);
scene.add(light);

let count = 0

const animate = () => {

  meshes.forEach(mesh => {
    mesh.position.z = Math.sin(count * 0.02) * mesh.direction
  })


  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
