import * as THREE from 'three'
import { lerp } from 'canvas-sketch-util/math'
import random from 'canvas-sketch-util/random'
const glsl = require('glslify')



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)




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


const length = 100


const offsets = new THREE.InstancedBufferAttribute(new Float32Array(length ** 2 * 3), 3)
const divergence = new Float32Array(length)
const angle = new Float32Array(length)
const speed = new Float32Array(length)

for (let i = 0; i < length; i++) {
  offsets.setXYZ(
    i,
    random.gaussian() * 0.2,
    random.gaussian() * 2,
    random.gaussian() * 0.2
  )
  divergence[i] = random.rangeFloor(2, 6)

  angle[i] = random.gaussian() * 10

  speed[i] = random.range(1, 2)
}

geometry.addAttribute('offset', offsets)
geometry.addAttribute('divergence', new THREE.InstancedBufferAttribute(divergence, 1, false));
geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angle, 1, false));
geometry.addAttribute('speed', new THREE.InstancedBufferAttribute(speed, 1, false));

  

const vertexShader = glsl(/* glsl */`
  precision highp float;
  attribute vec3 position;
  attribute vec3 offset;
  attribute float divergence;
  attribute float angle;
  attribute float speed;
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
    
    if (time > divergence) {
      mvPosition.x += (divergence - time) * angle;
      mvPosition.y += time * speed - (divergence - time) * 2.0 * speed;
    } else {
      mvPosition.y += time * speed;
    }
    vec4 finalPosition = projectionMatrix * mvPosition;

    gl_Position = finalPosition;
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
    float alpha = smoothstep(0.1, 0.09, dist);

    vec3 color = hsl2rgb(
      noise(vec2(1.0, offset.y)),
      0.8,
      0.6
    );

    gl_FragColor = vec4(color, alpha * 0.8);
  }
`)

const material = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  depthTest: false,
  transparent: true
});


const object3D = new THREE.Mesh(geometry, material);
scene.add(object3D);


const clock = new THREE.Clock()
const animate = () => {

  camera.position.y = 5
  camera.position.z = 10

  material.uniforms.time.value = clock.getElapsedTime()
  
  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
