import * as THREE from 'three'
import { linspace, lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'


const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera()
camera.position.z = 1

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)

export const onResize = (
  width = window.innerWidth,
  height = window.innerHeight
) => {
  const aspect = width / height
  const zoom = 3;
  camera.left = -zoom * aspect;
  camera.right = zoom * aspect;
  camera.top = zoom;
  camera.bottom = -zoom;
  camera.near = -100;
  camera.far = 100;
  // camera.position.set(zoom, zoom, zoom);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix()
}
onResize()

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
const length = 30
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
  mesh.position.y = lerp(0, span, v)

  mesh.originalPosition = mesh.position.clone()

  mesh.scale.setScalar(0.05)
  meshes.push(mesh)
})

const container = new THREE.Group()
meshes.forEach(mesh => container.add(mesh))
container.position.set(-span / 2, -span / 2, 0)
scene.add(container)



let count = 0
const animate = () => {

  meshes.forEach(mesh => {
    const { x, y } = mesh.originalPosition
    const transform = random.noise3D(x, y, count)
    mesh.position.x = x + transform
    mesh.position.y = y + transform
  })

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 0.01
}
animate()


export { scene, camera, renderer }
