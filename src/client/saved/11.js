import * as THREE from 'three'
import random from 'canvas-sketch-util/random'
import { lerp } from 'canvas-sketch-util/math'
import palettes from 'nice-color-palettes'


// Set an initial random seed
random.setSeed(30630);
// Log it for later reproducibility
console.log('Random seed: %s', random.getSeed());

const palette = random.pick(palettes)

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera()
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)


renderer.domElement

export const onResize = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const zoom = 3;
  camera.left = -zoom * aspect;
  camera.right = zoom * aspect;
  camera.top = zoom;
  camera.bottom = -zoom;
  camera.near = -100;
  camera.far = 100;
  camera.position.set(zoom, zoom, zoom);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix()
}
onResize()


const geometry = new THREE.SphereGeometry(1, 32, 32)


const meshes = []
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      
      

    const material = new THREE.MeshStandardMaterial({
      color: random.pick(palette),
      metalness: 0,
      roughness: 1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = i
    mesh.position.y = j
    mesh.position.z = k

    mesh.scalar = lerp(0, 1, random.gaussian()) * 0.1

    meshes.push(mesh)

    }
  }
}
const container = new THREE.Group()
container.position.set(-1.5, -1.5, 0)
meshes.forEach(mesh => container.add(mesh))
scene.add(container)


const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 1, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);

let count = 1

const animate = () => {

  meshes.forEach(mesh => {
    const func = random.pick([Math.cos, Math.sin])

    mesh.scale.setScalar(
      func(count * 0.02) * mesh.scalar
    )
  })

  scene.rotation.z += 0.01

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
