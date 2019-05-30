import * as THREE from 'three'
import { lerp, clamp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')
import * as Stats from './assets/stats'

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

const axesHelper = new THREE.AxesHelper(5)
scene.add( axesHelper )


const length = 20
const span = 20

const geometry = new THREE.BufferGeometry()


const uvs = []
const positions = []

for (let s = 0, i = 0; s < length; s ++, i += 3 ) {

  const segment =  s / length * Math.PI * 2

  positions.push(
    span * Math.cos( segment ),
    0,
    span * Math.sin( segment )
  )
  uvs.push(
    ( positions[ i + 0 ] / span + 1 ) / 2,
    ( positions[ i + 1 ] / span + 1 ) / 2,
    ( positions[ i + 2 ] / span + 1 ) / 2,
  )
}

geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 3 ) );
console.log(geometry)

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

  void main() {
    vUv = uv;
    vPosition = position;
    vTime = time;
    vCameraPosition = cameraPosition;

    vec3 rotatedPosition = rotate(position, vec3(0.0, 1.0, 0.0), time * 10.0);

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
      float dist2 = length(fTime - vUv.z);
      float scalar = map(dist2, 0.0, 0.8, 2.0, 0.0);
    float opacity = clamp(scalar, 1.0, 5.0);

    float visibility = map(distance, 0.0, maxDistance, 1.0, 0.0);

    gl_FragColor = vec4(color, alpha * opacity * visibility);
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

camera.position.y = span
camera.position.z = span * 2
camera.lookAt(0, 0, 0)

const offset = { x: 0, y: 0, z: 0 }

const clock = new THREE.Clock()
const animate = () => {
  stats.begin()

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
