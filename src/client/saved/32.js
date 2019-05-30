import * as THREE from 'three'
import { linspace, lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
import BezierEasing from 'bezier-easing'
const glsl = require('glslify')

import * as Stats from './assets/stats'
import { TweenMax } from 'gsap';
const stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


random.setSeed(70)
console.log(random.getSeed())
const length = 200
const span = 50




const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('orange');
document.body.appendChild(renderer.domElement)


const axesHelper = new THREE.AxesHelper(span)
scene.add( axesHelper )





const geometry = new THREE.InstancedBufferGeometry();
// positions
const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
positions.setXYZ(0, -0.5,  0.5,  0.0);
positions.setXYZ(1,  0.5,  0.5,  0.0);
positions.setXYZ(2, -0.5, -0.5,  0.0);
positions.setXYZ(3,  0.5, -0.5,  0.0);
geometry.addAttribute('position', positions);
// uvs
const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
uvs.setXYZ(0,  0.0,  0.0);
uvs.setXYZ(1,  1.0,  0.0);
uvs.setXYZ(2,  0.0,  1.0);
uvs.setXYZ(3,  1.0,  1.0);
geometry.addAttribute('uv', uvs);
// index
geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));


const points = []
for (let i = 0; i < length; i++) {
  for (let j = 0; j < length; j++) {
    const u = i / (length - 1)
    const v = j / (length - 1)
    points.push([ u, v ])
  }
}
const offsets = new THREE.InstancedBufferAttribute(new Float32Array(length ** 2 * 3), 3)
points.forEach(([ u, v ], i) => {
  const x = lerp(-span, span, u)
  const z = lerp(-span, span, v)

  const ny = random.noise4D(x / 4, 0, z, 0, 0.25, 1 )
  const nyy = random.noise4D(x / 4, 0, z, 1, 0.05, 4)
  
  offsets.setXYZ(i, x, ny + nyy, z)
})
geometry.addAttribute('offset', offsets)

const vertexShader = glsl(/* glsl */`
  precision highp float;
  attribute vec3 position;
  attribute vec3 offset;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float time;
  varying vec2 vUv;
  varying vec3 foffset;
  #pragma glslify: noise = require('glsl-noise/simplex/4d');
  void main() {
    vUv = uv;
    foffset = offset;
    // float ny = noise(vec4(offset.x / 4.0, 0, offset.z, time));
    vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
    mvPosition.xyz += position;
    vec4 finalPosition = projectionMatrix * mvPosition;

    gl_Position = finalPosition;
  }
`)
const fragmentShader = glsl(/* glsl */`
  precision highp float;
  varying vec3 foffset;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    vec3 offset = foffset;

    vec2 center = vUv - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.05, 0.03, dist);

    vec3 color = vec3(
      clamp(mod(floor(offset.y * 10.0), 2.0), 255.0 / 255.0, 1.0),
      clamp(mod(floor(offset.y * 10.0), 2.0), 215.0 / 255.0, 1.0),
      clamp(mod(floor(offset.y * 10.0), 2.0), 0.0 / 255.0, 1.0)
    );

    gl_FragColor = vec4(color, alpha);
  }
`)


const material = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  depthTest: false,
  transparent: true,
  side: THREE.DoubleSide,
  // blending: THREE.AdditiveBlending
});


const object3D = new THREE.Mesh(geometry, material);
scene.add(object3D);

// camera.position.y = 4
// camera.position.z = 4
// const lookAt = { x: 0, y: 0, z: 0 }

let cameraY = 4
let cameraZ = 4

const cameraMove = { x: 0, y: 0, z: 0 }
const lookAt = { x: 0, y: 0, z: 0 }

let count = 0
const animate = () => {
  stats.begin()


  cameraY += count * 0.1
  cameraZ += count * 1

  camera.position.x = 0       + cameraMove.x
  camera.position.y = cameraY + cameraMove.y
  camera.position.z = cameraZ + cameraMove.z
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
  
  renderer.render( scene, camera )

  stats.end();
  requestAnimationFrame(animate)
  count += 0.00001
}
animate()


window.addEventListener('mousemove', ({ clientX, clientY }) => {
  // x: - (window.innerWidth / 2 - clientX) * 0.01,
  // TweenMax.to(lookAt, 1, {
  //   x: lerp(-1, 1, clientX / window.innerWidth),
  //   y: lerp(1, -1, clientY / window.innerHeight),
  // })
  TweenMax.to(cameraMove, 1, {
    x: lerp(2, -2, clientX / window.innerWidth),
    y: lerp(-2, 2, clientY / window.innerHeight),
  })
  TweenMax.to(lookAt, 1, {
    x: lerp(-0.5, 0.5, clientX / window.innerWidth),
    y: lerp(0.5, -0.5, clientY / window.innerHeight),
  })
})


export { scene, camera, renderer }
