import * as THREE from 'three'


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 'cyan'
})

const groupMesh = new THREE.Object3D()
for (let i = 0; i < 4; i++) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = i
  mesh.rotation.set(1, 1, 1)
  groupMesh.add(mesh)
}
scene.add(groupMesh)


const animate = () => {
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
