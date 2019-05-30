import * as THREE from 'three'
import { lerp, pingPong } from 'canvas-sketch-util/math'
import { TweenMax, Power1 } from 'gsap'


const radius = 2


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 10

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 15%)');
document.body.appendChild(renderer.domElement)

const geometry = new THREE.TorusGeometry(.3, .12, 30, 200)
const material = new THREE.MeshStandardMaterial({
  color: 'pink',
  metalness: 0.58,
  roughness: 0.18
})

const gridCols = 14
const gridRows = 6
const meshes = []
for (let i = 0; i < gridCols; i++) {
  for (let j = 0; j < gridRows; j++) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(i, j, 0)
    mesh.scale.setScalar(0.5)
    meshes.push(mesh)
  }
}

const container = new THREE.Group()
meshes.forEach(mesh => container.add(mesh))
container.position.set(
  -(gridCols - 1) / 2,
  -(gridRows - 1) / 2,
  0
)
scene.add(container)


const light = new THREE.SpotLight('yellow', 1);
light.position.set(0, 0, 100);
scene.add(light);

const ambientLight = new THREE.AmbientLight('red', 1);
scene.add(ambientLight);


const floorGeometry = new THREE.PlaneGeometry(gridCols + radius, gridRows + radius)
const floorMaterial = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 })
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
scene.add(floor)



const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', event => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

const distanceBetween = ({ x: x1, y: y1 } = {}, { x: x2, y: y2 } = {}) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

let count = 1
const animate = () => {

  // maps our mouse coordinates from the camera perspective
  raycaster.setFromCamera(mouse, camera);

  // checks if our mouse coordinates intersect with our floor shape
  const intersects = raycaster.intersectObjects([floor]);
  
  // 2 on initial load
  if (intersects.length < 2) {

    meshes.forEach(mesh => {

        const distance = distanceBetween(
          intersects[0] && intersects[0].point,
          { x: mesh.position.x + container.position.x,
            y: mesh.position.y + container.position.y }
        )

        const value = distance < radius && pingPong(1 / distance, 3)
      
        TweenMax.to(mesh.scale, 1, {
          x: value || 0.5,
          y: value || 0.5,
          z: value || 0.5,
          ease: Power1.easeOut
        })
        TweenMax.to(mesh.position, 1, {
          z: value || 0,
          ease: Power1.easeOut
        })
        TweenMax.to(mesh.rotation, 1, {
          x: value || 0,
          y: value || 0,
          z: value || 0,
          ease: Power1.easeOut
        })
    })
  }

  // if (intersects.length) {

  //   // get the x and z positions of the intersection
  //   const { x, z } = intersects[0].point;

  //   for (let row = 0; row < this.grid.rows; row++) {
  //     for (let col = 0; col < this.grid.cols; col++) {

  //       // extract out mesh base on the grid location
  //       const mesh = this.meshes[row][col];

  //       // calculate the distance from the intersection down to the grid element
  //       const mouseDistance = distance(x, z,
  //         mesh.position.x + this.groupMesh.position.x,
  //         mesh.position.z + this.groupMesh.position.z);

  //       // based on the distance we map the value to our min max Y position
  //       // it works similar to a radius range

  //       const maxPositionY = 10;
  //       const minPositionY = 0;
  //       const startDistance = 6;
  //       const endDistance = 0;
  //       const y = map(mouseDistance, startDistance, endDistance, minPositionY, maxPositionY);

  //       // based on the y position we animate the mesh.position.y
  //       // we don´t go below position y of 1
  //       TweenMax.to(mesh.position, .4, { y: y < 1 ? 1 : y });

  //       // create a scale factor based on the mesh.position.y
  //       const scaleFactor = mesh.position.y / 2.5;

  //       // to keep our scale to a minimum size of 1 we check if the scaleFactor is below 1
  //       const scale = scaleFactor < 1 ? 1 : scaleFactor;

  //       // animates the mesh scale properties
  //       TweenMax.to(mesh.scale, .4, {
  //         ease: Back.easeOut.config(1.7),
  //         x: scale,
  //         y: scale,
  //         z: scale,
  //       });

  //       // rotate our element
  //       TweenMax.to(mesh.rotation, .7, {
  //         ease: Back.easeOut.config(1.7),
  //         x: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.x),
  //         z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
  //         y: map(mesh.position.y, -1, 1, radians(90), mesh.initialRotation.y),
  //       });
  //     }
  //   }
  // }

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
