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


const vertexShader = glsl(/* glsl */`
  varying vec2 vUv;

  uniform float time;

  #pragma glslify: noise = require('glsl-noise/simplex/4d');

  void main () {
    vUv = uv;

    vec3 transformed = position.xyz;

    float offset = 0.0;
    offset += 0.5 * (noise(vec4(normal.xyz * 2.0, time * 0.25)) * 0.2 + 0.5);

    transformed += normal * offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`);

const fragmentShader = glsl(/* glsl */`
  varying vec2 vUv;
  uniform float time;

  // #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');
  float pi = 3.1415926535897932384626433832795;
  
  void main () {
    vec3 color = vec3(
      clamp(mod(floor(vUv.y * 10.0), 2.0), 215.0 / 255.0, 1.0),
      clamp(mod(floor(vUv.y * 10.0), 2.0), 215.0 / 215.0, 1.0),
      clamp(mod(floor(vUv.y * 10.0), 2.0), 150.0 / 215.0, 1.0) 
    );
    gl_FragColor = vec4(color, 1.0);
  }
`)

const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { type: "f", value: Math.sin(0.5) }
    },
    vertexShader,
    fragmentShader,
    wireframe: true
})
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64)
const sphere = new THREE.Mesh(sphereGeometry, material)
sphere.rotation.x = 1
sphere.rotation.y = 1
sphere.rotation.z = -0.5
scene.add(sphere)



const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 5, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);


let count = 0
const animate = () => {

  scene.rotation.y += 0.02

  material.uniforms.time.value = count * 0.1

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
