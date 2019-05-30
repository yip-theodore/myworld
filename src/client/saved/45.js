import * as THREE from 'three'
import { lerp, clamp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')
import * as Stats from './assets/stats'

const { cos, sin, PI } = Math
const toRad = angle => angle * PI / 180


const stats = new Stats()
stats.showPanel(0)
document.body.appendChild( stats.dom );



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('black')
document.body.appendChild(renderer.domElement)

const axesHelper = new THREE.AxesHelper(20)
scene.add( axesHelper )



const uvs = []
const positions = []


let protection = 0



function applyMatrix (position, a) {
  
  const p = new THREE.Vector3(
    position.x,
    position.y,
    position.z,
  )

  const m = new THREE.Matrix3().set(
    cos(a.y)*cos(a.z),    cos(a.x)*sin(a.z) + sin(a.x)*sin(a.y)*cos(a.z),   sin(a.x)*sin(a.z) - cos(a.x)*sin(a.y)*cos(a.z),
    -cos(a.y)*sin(a.z),   cos(a.x)*cos(a.z) - sin(a.x)*sin(a.y)*sin(a.z),   sin(a.x)*cos(a.z) + cos(a.x)*sin(a.y)*sin(a.z),
    sin(a.y),             -sin(a.x)*cos(a.y),                               cos(a.x)*cos(a.y)
  )
  return p.applyMatrix3(m)
}

function applyRotation (position = { x: 0, y: 0, z: 0 }, angle = { x: 0, y: 0, z: 0 }, offset = { x: 0, y: 0, z: 0 }, splitNb) {
  
  const _position = {
    x: position.x,
    y: position.y - positions[positions.length - 2],
    z: position.z,
  }
  const newPosition = applyMatrix(_position, angle)
  
  return {
    x: newPosition.x + offset.x,
    y: newPosition.y + offset.y,
    z: newPosition.z + offset.z,
  }
}

function createCercle (radius = 10, pointsNb = 20, angle, offset, n, splitNb) {
  for (let i = 0; i < pointsNb; i++) {

    const point = i / pointsNb * PI * 2

    const position = {
      x: radius * cos(point),
      y: n * 5,
      z: radius * sin(point),
    }
    const rotatedPosition = applyRotation(position, angle, offset, splitNb)
    positions.push(rotatedPosition.x, rotatedPosition.y, rotatedPosition.z)

    uvs.push(
      ( positions[i * pointsNb + 0] / radius + 1 ) / 2,
      ( positions[i * pointsNb + 1] / radius + 1 ) / 2,
      ( positions[i * pointsNb + 2] / radius + 1 ) / 2,
    )
  }
}



function go (n = 1, angle = { x: 0, y: 0, z: 0 }, offset = { x: 0, y: 0, z: 0 }, splitNb = 0) {
  if (protection++ > 1000) return console.log('infinite')
  if (n > 30) return


  createCercle(10 - (splitNb * 2), undefined, angle, offset, n, splitNb)
  
  // const doSplit = random.chance(0.05)
  const doSplit = n % 5 === 0
  
  if (!doSplit) {
    go(n+1, angle, offset, splitNb)

  } else {
    console.log('split')

    const newAngle1 = {
      x: toRad(random.range(-90, 91)),
      y: toRad(random.range(-90, 91)),
      z: toRad(random.range(-90, 91)),
    }
    const newOffset = getLastCercleCenter()
    
    go(n+1, newAngle1, newOffset, splitNb+1)
    go(n+1, { x: 0, y: 0, z: 0 }, newOffset, splitNb+1)
  }
}

go()

function getLastCercleCenter (pointsNb = 20) {
  let sum = { x: 0, y: 0, z: 0 }
  for (let i = 0; i < 20; i++) {
    sum.x += positions[positions.length - (3*i) - 3]
    sum.y += positions[positions.length - (3*i) - 2]
    sum.z += positions[positions.length - (3*i) - 1]
  }
  return {
    x: sum.x / pointsNb,
    y: sum.y / pointsNb,
    z: sum.z / pointsNb,
  }
}




const geometry = new THREE.BufferGeometry()

geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 3 ) );


const vertexShader = glsl(/* glsl */`
  precision highp float;

  attribute vec3 uv;
  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec3 cameraPosition;

  uniform float time;

  varying vec3 vUv;
  varying vec3 vPosition;
  varying float vTime;
  varying vec3 vCameraPosition;

  #pragma glslify: noise = require('glsl-noise/simplex/4d');

  float toRad (float degree) {
    return degree * 3.1415926535897932384626433832795 / 180.0;
  }

  vec3 rotate (vec3 position, vec3 axis, float degree) {

    float angle = toRad(degree);

    return vec3(
      position.x * (axis.x*axis.x * (1.0 - cos(angle)) + cos(angle))
          + position.y * (axis.x*axis.y * (1.0 - cos(angle)) + axis.z * sin(angle))
          + position.z * (axis.x*axis.z * (1.0 - cos(angle)) - axis.y * sin(angle)),

      position.x * (axis.y*axis.x * (1.0 - cos(angle)) - axis.z * sin(angle))
          + position.y * (axis.y*axis.y * (1.0 - cos(angle)) + cos(angle))
          + position.z * (axis.y*axis.z * (1.0 - cos(angle)) + axis.x * sin(angle)),

      position.x * (axis.z*axis.x * (1.0 - cos(angle)) + axis.y * sin(angle))
          + position.y * (axis.z*axis.y * (1.0 - cos(angle)) - axis.x * sin(angle))
          + position.z * (axis.z*axis.z * (1.0 - cos(angle)) + cos(angle))
    );
  }

  mat3 rotationMatrix(vec3 axis, float angle)
  {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;

      return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c          );
  }

  void main() {
    vUv = uv;
    vPosition = position;
    vTime = time;
    vCameraPosition = cameraPosition;

    //vec3 rotatedPosition = position;//rotate(position, vec3(0.0, 1.0, 0.0), time * 10.0);
    mat3 m = rotationMatrix(vec3(0.0, 1.0, 0.0), toRad(time * 10.0));
    vec3 rotatedPosition = position * m;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPosition, 1.0);
    gl_PointSize = 1000.0 / length(cameraPosition - rotatedPosition);
  }
`)
const fragmentShader = glsl(/* glsl */`
  precision highp float;

  varying vec3 vUv;
  varying vec3 vPosition;
  varying float vTime;
  varying vec3 vCameraPosition;

  float map (float value, float min1, float max1, float min2, float max2) {
    // Convert the current value to a percentage // 0% - min1, 100% - max1
    float perc = (value - min1) / (max1 - min1);
    // Do the same operation backwards with min2 and max2
    return perc * (max2 - min2) + min2;
  }

  float maxDistance = 1000.0;

  void main () {
    
    float distance = length(vPosition - vCameraPosition);
    if (distance > maxDistance) { discard; }

    vec3 color = vec3(1.0);

      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
    float alpha = smoothstep(0.2, 0.0, dist);

      float time = -vTime * 0.2;
      float fTime = (time - floor(time)) * 3.0 - 1.0;
      float dist2 = length(fTime - vUv.y);
      float scalar = map(dist2, 0.0, 0.8, 2.0, 0.0);
    float opacity = clamp(scalar, 1.0, 5.0);

    float visibility = map(distance, 0.0, maxDistance, 1.0, 0.0);

      float time2 = vTime * 20.0;
    float oopa;
      if (time2 > vUv.y) { oopa = 1.0; }
      else if (time2 > vUv.y + 5.0 ) { discard; }
      else { oopa = map(length(time2 - vUv.y), 0.0, 5.0, 1.0, 0.0); }

    gl_FragColor = vec4(color, alpha * opacity * visibility * 0.5);
  }
`)

const material = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 0 },
    origin: { value: new THREE.Vector3() },
  },
  vertexShader,
  fragmentShader,
  depthTest: false,
  transparent: true,
  blending: THREE.AdditiveBlending
})

const object = new THREE.Points(geometry, material)
scene.add(object)


camera.position.y = 100
camera.position.z = 150
object.rotation.y = PI
// camera.lookAt(0, 0, 0)

const offset = { x: 0, y: 0, z: 0 }

const clock = new THREE.Clock()
const animate = () => {
  stats.begin()

  // object.rotation.y += 0.002

  const time = clock.getElapsedTime()

  material.uniforms.time.value = time
  
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  stats.end()
}
animate()


// window.addEventListener('mousemove', ({ clientX, clientY }) => {
//   const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
//   offset.x = (center.x - clientX) * 0.1
//   offset.y = -(center.y - clientY) * 0.1
// })


export { scene, camera, renderer }
