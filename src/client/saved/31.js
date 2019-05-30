import * as THREE from 'three'
import { linspace, lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
import BezierEasing from 'bezier-easing'
const glsl = require('glslify')

import * as Stats from './assets/stats'
const stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('#222');
document.body.appendChild(renderer.domElement)



const geometry = new THREE.SphereGeometry(1, 8, 8)

// const vertexShader = glsl(/* glsl */`
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
//     gl_PointSize = 3.0;
//   }
// `)
// const fragmentShader = glsl(/* glsl */`
//   precision highp float;

//   varying vec2 vUv;

//   void main () {
//     vec2 center = vUv - 0.5;

//     vec2 coord = gl_PointCoord - vec2(0.5);

//     float dist = length(coord);

//     float alpha = smoothstep(0.5, 0.45, dist);
//     if(length(coord) > 0.45)                  //outside of circle radius?
//       discard;


//     gl_FragColor = vec4(vec3(1.0), alpha);
//   }
// `)
// const material = new THREE.ShaderMaterial({
//   vertexShader,
//   fragmentShader,
//   transparent: true
// })


const dot = () => {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = 'yellow'
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

const material = new THREE.PointsMaterial({
  // color: 'white',
  size: 0.05,
  map: dot(),
  blending: THREE.AdditiveBlending,
  // side: THREE.DoubleSide,
  // transparent: true,
  // opacity: 0.5,
  depthWrite: false
})

const spheres = [...Array(1)].map(_ => {
  const sphere = new THREE.Points(geometry, material)
  scene.add(sphere)
  return sphere
})


let count = 0
const animate = () => {
  stats.begin()

  spheres.forEach(sphere => {
    sphere.rotation.x = count
    sphere.rotation.z = count
  })



  renderer.render( scene, camera )
  stats.end();
  requestAnimationFrame(animate)
  count += 0.01
}
animate()


export { scene, camera, renderer }
