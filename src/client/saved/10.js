import * as THREE from 'three'
import random from 'canvas-sketch-util/random'
import palettes from 'nice-color-palettes'

const seed = random.getRandomSeed()
random.setSeed(935614)
console.log({ seed })
const palette = random.pick(palettes)

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera()
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
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


const geometry = new THREE.SphereGeometry(1, 1, 1)


const meshes = []
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {

    const material = new THREE.MeshStandardMaterial({
      color: random.pick(palette),
      metalness: 0,
      roughness: 1,
      flatShading: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = i
    mesh.position.y = j
    // mesh.rotation.set(i, 1, j)
    mesh.scale.setScalar(0.5)
    
    const momentum = random.rangeFloor(1, 5)
    mesh.direction = momentum * random.pick([-1, 1])

    meshes.push(mesh)
  }
}
const container = new THREE.Group()
container.position.set(-1.5, -1.5, 0)
meshes.forEach(mesh => container.add(mesh))
scene.add(container)


const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 1, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 1);
scene.add(ambientLight);

let count = 0

const animate = () => {

  meshes.forEach(mesh => {
    // mesh.position.z = Math.sin(count * 0.001) * mesh.direction
    // mesh.rotation.x = Math.sin(count * 0.02) * mesh.direction
    mesh.rotation.y += 0.01 * mesh.direction
  })


  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
