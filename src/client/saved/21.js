import * as THREE from 'three'
import { TweenMax, Power1 } from 'gsap'
const glsl = require('glslify')
import displacementImg from './assets/displacement-ocean.jpg'
import photo1Img from './assets/photo-1.jpg'
import photo2Img from './assets/photo-2.jpg'

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera()
camera.position.z = 5

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


const loader = new THREE.TextureLoader()
const photo1 = loader.load(photo1Img)
const photo2 = loader.load(photo2Img)

const disp = loader.load(displacementImg)


const vertex = glsl(/* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`)

const frag = glsl(/* glsl */`
  precision highp float;

  uniform float time;
  uniform float aspect;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () {
    // vec3 colorA = sin(time * 2.0) + vec3(1.0, 0.0, 1.0);
    // vec3 colorB = vec3(0.0, 0.0, 1.0);

    vec2 center = vUv - 0.5;
    center.x *= aspect;

    float dist = length(center);

    float alpha = smoothstep(0.2525, 0.25, dist);

    // vec3 color = mix(colorA, colorB, vUv.x + vUv.y * sin(time));
    // gl_FragColor = vec4(color, alpha);

    float n = noise(vec3(
      center.x * 1.5,
      center.y * 1.5 + 0.5,
      time * 0.5
    ));
    
    vec3 color = hsl2rgb(
      1.0 + n * 0.2,
      0.8,
      0.6
    );

    gl_FragColor = vec4(color, alpha);
  }
`)

const material = new THREE.ShaderMaterial({
    uniforms: {
        effectFactor: { type: "f", value: 0.5 },
        dispFactor: { type: "f", value: 0.0 },
        texture: { type: "t", value: photo1 },
        texture2: { type: "t", value: photo2 },
        disp: { type: "t", value: disp },
        aspect: { type: "f", value: 1 },
        time: { type: "f", value: Math.sin(0.5) },
    },

    vertexShader: vertex,
    fragmentShader: frag,
    transparent: true,
    opacity: 1.0
});

const geometry = new THREE.PlaneBufferGeometry(5, 5)
const object = new THREE.Mesh(geometry, material);
scene.add(object)



let count = 0
const animate = () => {
  
  material.uniforms.time.value = 0.5 + Math.sin(count * 0.02) / 2

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
