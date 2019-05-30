import * as THREE from 'three'
import { lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// export const onResize = (
//   width = window.innerWidth,
//   height = window.innerHeight
// ) => {
//   const aspect = width / height
//   const zoom = 20;
//   camera.left = -zoom * aspect;
//   camera.right = zoom * aspect;
//   camera.top = zoom;
//   camera.bottom = -zoom;
//   camera.near = -100;
//   camera.far = 100;
//   // camera.position.set(zoom, zoom, zoom);
//   camera.lookAt(0, 0, 0);
//   camera.updateProjectionMatrix()
// }
// onResize()

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)

const axesHelper = new THREE.AxesHelper(20)
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


const length = 200


const offsets = new THREE.InstancedBufferAttribute(new Float32Array(length * 3), 3)
const divergence = new Float32Array(length)
const angle = new Float32Array(length)
const speed = new Float32Array(length)
const stops1 = new THREE.InstancedBufferAttribute(new Float32Array(length * 3), 3)
const stops2 = new THREE.InstancedBufferAttribute(new Float32Array(length * 3), 3)
const stops3 = new THREE.InstancedBufferAttribute(new Float32Array(length * 3), 3)

for (let i = 0; i < length; i++) {
  const base = {
    x: random.rangeFloor(-3, 4),
    z: random.rangeFloor(-3, 4)
  }
  const initial = {
    x: 0,
    y: 0,
    z: 0
  }

  offsets.setXYZ(
    i,
    initial.x,
    initial.y,
    initial.z
  )
  divergence[i] = random.rangeFloor(2, 6)

  angle[i] = random.gaussian() * 10

  speed[i] = random.range(0, Math.PI * 2)
  
  stops1.setXYZ(
    i,
    initial.x,
    initial.y + 5,
    initial.z
  )
  stops2.setXYZ(
    i,
    initial.x,
    initial.y + 10,
    initial.z + base.z
  )
  stops3.setXYZ(
    i,
    initial.x,
    initial.y + 15,
    initial.z + base.z * Math.abs(base.z)
  )
}

geometry.addAttribute('offset', offsets)
geometry.addAttribute('divergence', new THREE.InstancedBufferAttribute(divergence, 1, false));
geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angle, 1, false));
geometry.addAttribute('speed', new THREE.InstancedBufferAttribute(speed, 1, false));
geometry.addAttribute('stop1', stops1)
geometry.addAttribute('stop2', stops2)
geometry.addAttribute('stop3', stops3)

  

const vertexShader = glsl(/* glsl */`
  precision highp float;
  // attribute vec3 position;
  attribute vec3 offset;
  attribute float divergence;
  attribute float angle;
  attribute float speed;
  attribute vec3 stop1;
  attribute vec3 stop2;
  attribute vec3 stop3;
  // attribute vec2 uv;
  // uniform mat4 modelViewMatrix;
  // uniform mat4 projectionMatrix;
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
    
    // if (time > divergence) {
    //   mvPosition.x += (divergence - time) * angle;
    //   mvPosition.y += time * speed - (divergence - time) * 2.0 * speed;
    // } else {
    //   mvPosition.y += time * speed;
    // }

    float cursor = (0.5 + sin(time + speed) / 2.0 ) * 3.0;

    if (cursor < 1.0) {
      mvPosition.xyz +=
        mix(
          offset, 
          stop1,
          clamp(0.0, 1.0, cursor)
        );
    } else if (cursor < 2.0) {
      mvPosition.xyz +=
        mix(
          stop1, 
          stop2,
          clamp(0.0, 1.0, cursor - 1.0)
        );
    } else {
      mvPosition.xyz +=
        mix(
          stop2, 
          stop3,
          clamp(0.0, 1.0, cursor - 2.0)
        );
    }


    // vec4 finalPosition = projectionMatrix * mvPosition;

    // gl_Position = finalPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 5.0;
  }
`)

const fragmentShader = glsl(/* glsl */`
  precision highp float;
  varying vec3 foffset;
  varying vec2 vUv;
  #pragma glslify: noise = require('glsl-noise/simplex/2d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');
  void main() {
    vec2 uv = vUv;
    vec3 offset = foffset;

    vec2 center = vUv - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.1, 0.05, dist);

    gl_FragColor = vec4(vec3(0.0), alpha * 0.8);
  }
`)

const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader,
  // fragmentShader,
  depthTest: false,
  transparent: true
});


const object3D = new THREE.Mesh(geometry, material);
scene.add(object3D);

// camera.position.x = 1
camera.position.y = 10
camera.position.z = 10
camera.lookAt(0, 0, 0)

const clock = new THREE.Clock()
const animate = () => {

  scene.rotation.y += 0.01

  // material.uniforms.time.value = clock.getElapsedTime()
  
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
