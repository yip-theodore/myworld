import * as THREE from 'three'
import { TweenMax, Power1 } from 'gsap'
const glsl = require('glslify')
import displacementImg from './assets/displacement-ocean.jpg'
import photo1Img from './assets/photo-1.jpg'
import photo2Img from './assets/photo-2.jpg'
// import 'three/examples/js/controls/OrbitControls';

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(-1024 / 2, 1024 / 2, -600 / 2, 600 / 2, -500, 10000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor('hsl(0, 0%, 95%)');
document.body.appendChild(renderer.domElement)

// export const onResize = (
//   width = window.innerWidth,
//   height = window.innerHeight
// ) => {
//   const aspect = width / height
//   const zoom = 3;
//   camera.left = -zoom * aspect;
//   camera.right = zoom * aspect;
//   camera.top = zoom;
//   camera.bottom = -zoom;
//   camera.near = -500;
//   camera.far = 1000;
//   // camera.position.set(zoom, zoom, zoom);
//   camera.lookAt(0, 0, 0);
//   camera.updateProjectionMatrix()
// }
// onResize()


const loader = new THREE.TextureLoader()
const photo1 = loader.load(photo1Img)
const photo2 = loader.load(photo2Img)

const disp = loader.load(displacementImg)


const vertexShader = glsl(/* glsl */`
varying vec2 vUv;
void main() {
	vUv = uv;	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`);

const fragmentShader = glsl(/* glsl */`
precision highp float;

varying vec2 vUv;
uniform float zoom;
uniform vec2 offset;
void main() {


  float square;

  float x = 0.0;
  float y = 0.0;

  float xt;
  float yt;

  vec2 c = (vUv - vec2(0.5, 0.5)) * 4.0 / zoom - offset;

  for(float i = 0.0; i < 1.0; i += 0.001) {

    xt = x * x - y * y + c.x;
    yt = 2.0 * x * y + c.y;

    x = xt;
    y = yt;

    square = x * x + y * y;
    gl_FragColor = vec4(sin(i * 2.0), i, sin(i * 2.0), 1.0);

    if(square >= 4.0) break;
  }



}
`)

const material = new THREE.ShaderMaterial({
    uniforms: {
      'zoom': {
        type: 'f',
        value: 1.0
      },
      'offset': {
        type: 'v2',
        value: new THREE.Vector2(1.150, 0.275)
      }
    },
    vertexShader,
    fragmentShader
})
const planeGeometry = new THREE.PlaneGeometry(1024, 600)

const sphere = new THREE.Mesh(planeGeometry, material)
sphere.rotation.x = -Math.PI

scene.add(sphere)



const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(0, 5, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);


// const controls = new THREE.OrbitControls( camera )
const clock = new THREE.Clock(true);

const animate = () => {

  material.uniforms.zoom.value *= 1 + 0.4 * clock.getDelta()

  renderer.render( scene, camera )
  requestAnimationFrame(animate)
}
animate()


export { scene, camera, renderer }
