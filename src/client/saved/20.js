import * as THREE from 'three'
import { TweenMax, Power1 } from 'gsap'
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


const vertex = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`

const fragment = `
    varying vec2 vUv;

    uniform sampler2D texture;
    uniform sampler2D texture2;
    uniform sampler2D disp;

    // uniform float time;
    // uniform float _rot;
    uniform float dispFactor;
    uniform float effectFactor;

    // vec2 rotate(vec2 v, float a) {
    //  float s = sin(a);
    //  float c = cos(a);
    //  mat2 m = mat2(c, -s, s, c);
    //  return m * v;
    // }

    void main() {

        vec2 uv = vUv;

        // uv -= 0.5;
        // vec2 rotUV = rotate(uv, _rot);
        // uv += 0.5;

        vec4 disp = texture2D(disp, uv);

        vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
        vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);

        vec4 _texture = texture2D(texture, distortedPosition);
        vec4 _texture2 = texture2D(texture2, distortedPosition2);

        vec4 finalTexture = mix(_texture, _texture2, dispFactor);

        gl_FragColor = finalTexture;
        // gl_FragColor = disp;
    }
`


const material = new THREE.ShaderMaterial({
    uniforms: {
        effectFactor: { type: "f", value: 0.5 },
        dispFactor: { type: "f", value: 0.0 },
        texture: { type: "t", value: photo1 },
        texture2: { type: "t", value: photo2 },
        disp: { type: "t", value: disp }
    },

    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0
});

const geometry = new THREE.PlaneBufferGeometry(5, 3)
const object = new THREE.Mesh(geometry, material);
scene.add(object)


let toggle = false
window.addEventListener('click', () => {
  TweenMax.to(material.uniforms.dispFactor, 1, {
      value: toggle ? 0 : 1,
      ease: Power1.easeOut
  });
  toggle = !toggle
})

// var hoverEffect = function(opts) {
// var vertex = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
//     }
// `;

// var fragment = `
//     varying vec2 vUv;

//     uniform sampler2D texture;
//     uniform sampler2D texture2;
//     uniform sampler2D disp;

//     // uniform float time;
//     // uniform float _rot;
//     uniform float dispFactor;
//     uniform float effectFactor;

//     // vec2 rotate(vec2 v, float a) {
//     //  float s = sin(a);
//     //  float c = cos(a);
//     //  mat2 m = mat2(c, -s, s, c);
//     //  return m * v;
//     // }

//     void main() {

//         vec2 uv = vUv;

//         // uv -= 0.5;
//         // vec2 rotUV = rotate(uv, _rot);
//         // uv += 0.5;

//         vec4 disp = texture2D(disp, uv);

//         vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
//         vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);

//         vec4 _texture = texture2D(texture, distortedPosition);
//         vec4 _texture2 = texture2D(texture2, distortedPosition2);

//         vec4 finalTexture = mix(_texture, _texture2, dispFactor);

//         gl_FragColor = finalTexture;
//         // gl_FragColor = disp;
//     }
// `;

// var parent = opts.parent || console.warn("no parent");
// var dispImage = opts.displacementImage || console.warn("displacement image missing");
// var image1 = opts.image1 || console.warn("first image missing");
// var image2 = opts.image2 || console.warn("second image missing");
// var intensity = opts.intensity || 1;
// var speedIn = opts.speedIn || 1.6;
// var speedOut = opts.speedOut || 1.2;
// var userHover = (opts.hover === undefined) ? true : opts.hover;
// var easing = opts.easing || Expo.easeOut;


// var scene = new THREE.Scene();
// var camera = new THREE.OrthographicCamera(
//     parent.offsetWidth / -2,
//     parent.offsetWidth / 2,
//     parent.offsetHeight / 2,
//     parent.offsetHeight / -2,
//     1,
//     1000
// );

// camera.position.z = 1;

// var renderer = new THREE.WebGLRenderer({
//     antialias: false,
//     // alpha: true
// });

// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setClearColor(0xffffff, 0.0);
// renderer.setSize(parent.offsetWidth, parent.offsetHeight);
// parent.appendChild(renderer.domElement);

// // var addToGPU = function(t) {
// //     renderer.setTexture2D(t, 0);
// // };

// var loader = new THREE.TextureLoader();
// loader.crossOrigin = "";
// var texture1 = loader.load(image1);
// var texture2 = loader.load(image2);

// var disp = loader.load(dispImage);
// disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

// texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
// texture1.minFilter = texture2.minFilter = THREE.LinearFilter;

// texture1.anisotropy = renderer.getMaxAnisotropy();
// texture2.anisotropy = renderer.getMaxAnisotropy();

// var mat = new THREE.ShaderMaterial({
//     uniforms: {
//         effectFactor: { type: "f", value: intensity },
//         dispFactor: { type: "f", value: 0.0 },
//         texture: { type: "t", value: texture1 },
//         texture2: { type: "t", value: texture2 },
//         disp: { type: "t", value: disp }
//     },

//     vertexShader: vertex,
//     fragmentShader: fragment,
//     transparent: true,
//     opacity: 1.0
// });

// var geometry = new THREE.PlaneBufferGeometry(
//     parent.offsetWidth,
//     parent.offsetHeight,
//     1
// );
// var object = new THREE.Mesh(geometry, mat);
// scene.add(object);


let count = 1
const animate = () => {


  renderer.render( scene, camera )
  requestAnimationFrame(animate)
  count += 1
}
animate()


export { scene, camera, renderer }
