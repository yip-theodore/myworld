console.log('hello my world')
console.log('cool')

import '../styles/main.scss'
import style from '../styles/test.css'
console.log(style)

import * as THREE from 'three';
import * as random from 'canvas-sketch-util/random'
import fontJSON from '../assets/helvetiker_regular.typeface.json'


    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 20;

    
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor('yellow', 0.15);

    
    var geometry = new THREE.BoxGeometry( 1, 1, 20 );
    var metalMaterial = new THREE.MeshStandardMaterial({
      metalness: 1,
      color: 'limegreen'
    });
    var material = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0,
      color: 'cyan',
      flatShading: true
    });

    var cube = new THREE.Mesh( geometry, metalMaterial );
    scene.add( cube );
    
    cube.rotation.x = 1
    cube.rotation.y = 1
    cube.rotation.z = 1

    cube.scale.setScalar(2)
    cube.originalScale = cube.scale.clone();

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3( -10, 0, 0) );
    lineGeometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
    lineGeometry.vertices.push(new THREE.Vector3( 10, 0, 0) );
    lineGeometry.vertices.push(new THREE.Vector3( 0, -10, 0) );
    lineGeometry.vertices.push(new THREE.Vector3( -10, 0, 0) );

    const linesGroup = new THREE.Group()

    const lines = [...Array(40)].map((_, i) => {
      const line = new THREE.Line( lineGeometry, material )
      
      line.rotation.x = i * 0.05
      line.rotation.y = i * 0.05
      return line
    })
    
    lines.forEach(line => linesGroup.add(line))
    
    scene.add( linesGroup );


    const sphereGeometry = new THREE.SphereGeometry(5, 8, 8)
    const sphere = new THREE.Mesh(sphereGeometry, material)
    scene.add(sphere)



    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(0, 0, 4);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight('yellow', 0.5);
    scene.add( ambientLight );


    var loader = new THREE.FontLoader();
    const font = new THREE.Font(fontJSON)
    // loader.load( './assets/helvetiker_regular.typeface.json', function ( font ) {

      var textGeometry = new THREE.TextGeometry( 'Hello\nmy world', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
      } );
      const text = new THREE.Mesh(textGeometry, material)
      text.scale.setScalar(0.1)
      scene.add(text)
    // } );


    let count = 0
    function animate() {
      requestAnimationFrame( animate );

      cube.rotation.z += 0.01
      cube.scale.z = 2 + Math.sin(count * 0.01) * 1.5

      // Add slight movement


      lines.forEach(line => {
        line.rotation.z += 0.02
      })

      sphere.rotation.x += 0.01
      sphere.rotation.y += 0.01
      
      // sphere.scale.multiplyScalar(1.1)
      renderer.render( scene, camera );
      camera.position.x = Math.sin(count * 0.01) * 5
      camera.position.y = Math.cos(count * 0.01) * 5
      camera.position.z = 15 + ( Math.sin(count * 0.01) + Math.cos(count * 0.01) ) * 5

      light.position.x = Math.sin(count * 0.01) * 5 * 2
      light.position.y = Math.cos(count * 0.01) * 5 * 2
      light.position.z = 15 + ( Math.sin(count * 0.01) + Math.cos(count * 0.01) ) * 5 * 2
      count += 1
    }
    animate();
  
export { scene, camera, renderer }

