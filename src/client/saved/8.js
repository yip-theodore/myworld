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
const material = new THREE.MeshStandardMaterial({
  color: 'white',
  metalness: 0.8,
  roughness: 0
})

const groupMesh = new THREE.Object3D()
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = i
    mesh.position.y = j
    mesh.rotation.set(i, 1, j)
    mesh.scale.setScalar(0.5)
    groupMesh.add(mesh)
  }
}
scene.add(groupMesh)


const light = new THREE.DirectionalLight('white', 1);
light.position.set(0, 1, 2);
scene.add(light);

const animate = () => {
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
