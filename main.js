import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75 , window.innerWidth / window.innerHeight, 1, 100)
const renderer = new THREE.WebGLRenderer()
const controls = new OrbitControls(camera, renderer.domElement)
const radius = 30

camera.position.set(0, 0, 0);
controls.target.set(0, 0, 0); // The center of the video sphere

controls.enablePan = false
controls.enableZoom = false


let spherical = new THREE.Spherical(1, Math.PI / 2, 0)
spherical.makeSafe()
camera.position.setFromSpherical(spherical)

let src = 'https://s.bepro11.com/vr-video-sample.mp4'
const video = document.getElementById('remote-video')
video.src = src
video.loop = true
video.muted = true
video.playsInline = true
video.crossOrigin = 'anonymous'
video.play()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const texture = new THREE.VideoTexture(video)
const geometry = new THREE.SphereGeometry(radius, 32, 24)
const material = new THREE.MeshBasicMaterial({ map: texture})
material.side = THREE.BackSide

const sphere = new THREE.Mesh(geometry, material)
scene.add(sphere)

const materialW = new THREE.MeshBasicMaterial({ wireframe: true})
const sphereWire = new THREE.Mesh(geometry, materialW)
material.side = THREE.BackSide
scene.add(sphereWire)


const direction = new THREE.Vector3();
camera.getWorldDirection(direction);



function animate() {
    requestAnimationFrame(animate)
  
    renderer.render(scene, camera)
    // const direction = new THREE.Vector3();
    // console.log(camera.getWorldDirection(direction))
    // console.log("x = " +camera.position.x)
    // console.log("y = " +camera.position.y)
    // console.log("z = " +camera.position.z)
  }
  
  animate()
  window.addEventListener('resize', onWindowResize)

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  renderer.domElement.addEventListener('wheel', handleZoom)


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

  function handleZoom(e) {
    camera.fov = clamp(camera.fov + e.deltaY / 10, 10, 100)
    camera.updateProjectionMatrix()
  } 

  console.log(geometry.attributes)
