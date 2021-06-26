import {
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding,
  Scene,
  SpotLight,
  PerspectiveCamera,
  HemisphereLight,
  AmbientLight,
  IcosahedronGeometry,
  OrthographicCamera,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  MeshStandardMaterial,
  Vector3,
  Box3,
  AxesHelper,
} from '../../third_party/three.module.js'
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js"
import { FaceMeshFaceGeometry } from '../../js/face.js'
// import { OrbitControls } from '../../third_party/OrbitControls.js'

const av = document.querySelector('gum-av')
const canvas = document.querySelector('canvas')
const status = document.querySelector('#status')

// Set a background color, or change alpha to false for a solid canvas.
const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas })
// renderer.setClearColor(0x202020);
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
renderer.outputEncoding = sRGBEncoding

const scene = new Scene()
const camera = new OrthographicCamera(1, 1, 1, 1, -1000, 1000)

// Change to renderer.render(scene, debugCamera); for interactive view.
const debugCamera = new PerspectiveCamera(75, 1, 0.1, 1000)
debugCamera.position.set(0, 0, 300)
debugCamera.lookAt(scene.position)
// const controls = new OrbitControls(debugCamera, renderer.domElement)

let width = 0
let height = 0

function resize() {
  const videoAspectRatio = width / height
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const windowAspectRatio = windowWidth / windowHeight
  let adjustedWidth
  let adjustedHeight
  if (videoAspectRatio > windowAspectRatio) {
    adjustedWidth = windowWidth
    adjustedHeight = windowWidth / videoAspectRatio
  } else {
    adjustedWidth = windowHeight * videoAspectRatio
    adjustedHeight = windowHeight
  }
  console.log('======width, height=====', width, height, windowWidth, windowHeight, adjustedWidth, adjustedHeight)
  renderer.setSize(adjustedWidth, adjustedHeight)
  debugCamera.aspect = videoAspectRatio
  debugCamera.updateProjectionMatrix()
}

window.addEventListener('resize', () => {
  resize()
})
resize()
renderer.render(scene, camera)
// renderer.render(scene, debugCamera)

// Load textures for mask material.
const colorTexture = new TextureLoader().load('../../assets/UV_Grid_Sm.jpg')
const aoTexture = new TextureLoader().load('../../assets/ao.jpg')
const alphaTexture = new TextureLoader().load('../../assets/mask.png')

// Create wireframe material for debugging.
const wireframeMaterial = new MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true
})

// Create material for mask.
const material = new MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.8,
  metalness: 0.1,
  alphaMap: alphaTexture,
  aoMap: aoTexture,
  map: colorTexture,
  roughnessMap: colorTexture,
  transparent: true,
  side: DoubleSide,
  // opacity: 0,
})

// Create a new geometry helper.
const faceGeometry = new FaceMeshFaceGeometry({normalizeCoords: true})

// Create mask mesh.
const mask = new Mesh(faceGeometry, material)
scene.add(mask)
mask.receiveShadow = mask.castShadow = true

// Add lights.
const spotLight = new SpotLight(0xffffbb, 1)
spotLight.position.set(0.5, 0.5, 1)
spotLight.position.multiplyScalar(400)
scene.add(spotLight)

spotLight.castShadow = true

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024

spotLight.shadow.camera.near = 200
spotLight.shadow.camera.far = 800

spotLight.shadow.camera.fov = 40

spotLight.shadow.bias = -0.001125

scene.add(spotLight)

const hemiLight = new HemisphereLight(0xffffbb, 0x080820, 0.25)
scene.add(hemiLight)

const ambientLight = new AmbientLight(0x404040, 0.25)
scene.add(ambientLight)

const axesHelper = new AxesHelper(250);
scene.add(axesHelper);

// Create a red material for the nose.
// const noseMaterial = new MeshStandardMaterial({
//   color: 0xff2010,
//   roughness: 0.4,
//   metalness: 0.1,
//   transparent: true
// })

// const nose = new Mesh(new IcosahedronGeometry(1, 0), noseMaterial)
// nose.castShadow = nose.receiveShadow = true
// scene.add(nose)
// nose.scale.setScalar(40);

const modelConfig = {
  'cat_eye_glasses': {
    offsetX: 0,
    offsetY: -.1,
    scalar: 80,
    filename: 'scene',
  },
  'glasses_25d': { // 效果一般
    offsetX: -.1,
    offsetY: -.1,
    scalar: 1.2,
    filename: 'scene',
  },
  'catwoman_mask': {
    offsetX: -.1,
    offsetY: -2,
    scalar: 8,
    filename: 'scene',
  },
  'super_mario_odyssey_hat': { // 反转了
    offsetX: 0,
    offsetY: 10,
    scalar: 0.03,
    filename: 'scene',
  },
  'rabbit_ears': {
    offsetX: 0,
    offsetY: 15,
    scalar: 5,
    filename: 'scene',
  },
  'glasses02': {
    offsetX: 0,
    offsetY: 0,
    scalar: 1.3,
    filename: 'glasses02',
  },
  'social_mask': {
    offsetX: 0,
    offsetY: -2,
    scalar: 120,
    filename: 'social_mask',
  },
  'christmas_deer_horns': {
    offsetX: 0,
    offsetY: 5,
    scalar: 120,
    filename: 'scene',
  },
  'kaiser_mustache': {
    offsetX: 0,
    offsetY: -8,
    scalar: 100,
    filename: 'scene',
  },
  'mustache': {
    offsetX: 0,
    offsetY: -8,
    scalar: 5,
    filename: 'scene',
  },
  'mustache_bigote': {
    offsetX: 0,
    offsetY: -8,
    scalar: 0.05,
    filename: 'scene',
  },
};
const MODEL_NAME = 'cat_eye_glasses';
const dynamicObj = await loadModel(`../../assets/3d/${MODEL_NAME}/${modelConfig[MODEL_NAME].filename}.gltf`, 'gltf');
// console.log('=======dynamicObj=======', dynamicObj);
scene.add(dynamicObj);
const box = new Box3().setFromObject(dynamicObj);
const boxSize = box.getSize(new Vector3()).length();
const boxCenter = box.getCenter(new Vector3());
// console.log('boxSize:', boxSize);
// console.log('boxCenter:', boxCenter);
// dynamicObj.position.copy(boxCenter);
// dynamicObj.scale.setScalar(10)

// Enable wireframe to debug the mesh on top of the material.
const wireframe = false

// Defines if the source should be flipped horizontally.
const flipCamera = true

async function render(model) {
  // Wait for video to be ready (loadeddata).
  await av.ready()

  // Flip video element horizontally if necessary.
  av.video.style.transform = flipCamera ? 'scaleX(-1)' : 'scaleX(1)'

  // Resize orthographic camera to video dimensions if necessary.
  if (width !== av.video.videoWidth || height !== av.video.videoHeight) {
    const w = av.video.videoWidth
    const h = av.video.videoHeight
    camera.left = -0.5 * w
    camera.right = 0.5 * w
    camera.top = 0.5 * h
    camera.bottom = -0.5 * h
    camera.updateProjectionMatrix()
    width = w
    height = h
    resize()
    faceGeometry.setSize(w, h)
  }

  // Wait for the model to return a face.
  const faces = await model.estimateFaces(av.video, false, flipCamera)

  av.style.opacity = 1
  status.textContent = ''

  // There's at least one face.
  if (faces.length > 0) {
    // Update face mesh geometry with new data.
    faceGeometry.update(faces[0], flipCamera)
    // Modify nose position and orientation.
    // const track = faceGeometry.track(6, 196, 419)
    const track = faceGeometry.track(5, 45, 275);
    // nose.position.copy(track.position);
    // nose.rotation.setFromRotationMatrix(track.rotation);
    dynamicObj.position.copy(track.position)
    dynamicObj.position.y = dynamicObj.position.y * 0.8
    dynamicObj.rotation.setFromRotationMatrix(track.rotation)
    dynamicObj.scale.setScalar(track.scale * 35 / boxSize) // 以 24.5 为基准

    // const rotateQuaternion = faceGeometry.pointTrack(6);
    // const curQuaternion = dynamicObj.quaternion;
		// curQuaternion.multiplyQuaternions(rotateQuaternion, curQuaternion);
		// curQuaternion.normalize();
		// dynamicObj.setRotationFromQuaternion(curQuaternion);
  }

  if (wireframe) {
    // Render the mask.
    renderer.render(scene, camera)
    // Prevent renderer from clearing the color buffer.
    renderer.autoClear = false
    renderer.clear(false, true, false)
    mask.material = wireframeMaterial
    // Render again with the wireframe material.
    renderer.render(scene, camera)
    mask.material = material
    renderer.autoClear = true
  } else {
    // Render the scene normally.
    renderer.render(scene, camera)
    // renderer.render(scene, debugCamera)
  }

  requestAnimationFrame(() => render(model))
}

// Init the demo, loading dependencies.
async function init() {
  await Promise.all([tf.setBackend('webgl'), av.ready()])
  status.textContent = 'Loading model...'
  const model = await facemesh.load({ maxFaces: 1 })
  status.textContent = 'Detecting face...'
  render(model)
}

function loadModel( file ) {
  return new Promise( ( res, rej ) => {
      const loader = new GLTFLoader();
      loader.load( file, function ( gltf ) {
          res( gltf.scene );
      }, undefined, function ( error ) {
          rej( error );
      } );
  });
}

init()
