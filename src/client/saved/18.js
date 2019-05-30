import * as THREE from 'three'
import random from 'canvas-sketch-util/random'
import { lerp } from 'canvas-sketch-util/math'
import { height } from 'window-size';
import palettes from 'nice-color-palettes'


// Set an initial random seed
random.setSeed(random.getRandomSeed());
// Log it for later reproducibility
console.log('Random seed: %s', random.getSeed());

const palette = random.pick(palettes)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('tomato');
document.body.appendChild(renderer.domElement)


renderer.domElement

// export const onResize = (
//   width = window.innerWidth,
//   height = window.innerHeight
// ) => {
//   console.log(width, height)
//   const aspect = width / height
//   const zoom = 3;
//   camera.left = -zoom * aspect;
//   camera.right = zoom * aspect;
//   camera.top = zoom;
//   camera.bottom = -zoom;
//   camera.near = -100;
//   camera.far = 100;
//   camera.position.set(zoom, zoom, zoom);
//   camera.lookAt(0, 0, 0);
//   camera.updateProjectionMatrix()
// }
// onResize()


const geometry = new THREE.IcosahedronGeometry(1)

const meshes = []
for (let i = 0; i < 200; i++) {
  
  const material = new THREE.MeshStandardMaterial({
    color: 'white',
    metalness: 0,
    roughness: 1
  })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.set(
    random.gaussian(),
    random.gaussian(),
    random.gaussian()
  )

  mesh.originalPosition = mesh.position.clone()
  mesh.offset = random.range(0, Math.PI * 2)

  mesh.scale.setScalar(0.1)
  meshes.push(mesh)

}
const container = new THREE.Group()
meshes.forEach(mesh => container.add(mesh))
scene.add(container)


const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 5, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', e => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
})

const floorGeometry = new THREE.PlaneGeometry(100, 100)
const floorMaterial = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 })
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
scene.add(floor)


let count = 1

const animate = () => {

  // raycaster.setFromCamera(mouse, camera);
  // const intersects = raycaster.intersectObjects([floor]);
  // const { x, y } = intersects[0].point

  meshes.forEach((mesh, i) => {
    mesh.position.set(
      lerp(0, mesh.originalPosition.x, 0.5 + Math.sin(mesh.offset + count * 0.01) / 2),
      lerp(-5, mesh.originalPosition.y, 0.5 + Math.sin(mesh.offset + count * 0.01) / 2),
      lerp(0, mesh.originalPosition.z, 0.5 + Math.sin(mesh.offset + count * 0.01) / 2),
    )
    mesh.scale.set(
      lerp(0, 0.1, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
      lerp(0, 0.1, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
      lerp(0, 0.1, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
    )
    mesh.rotation.set(
      lerp(0, Math.PI * 2, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
      lerp(0, Math.PI * 2, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
      lerp(0, Math.PI * 2, 0.5 + Math.sin(mesh.offset + count * 0.05) / 2),
    )
  })

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
