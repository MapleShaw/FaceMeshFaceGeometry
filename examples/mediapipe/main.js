/*
 * @Descripttion: 
 * @version: X3版本
 * @Author: maplexiao
 * @Date: 2021-05-20 20:07:51
 * @LastEditors: maplexiao
 * @LastEditTime: 2021-06-26 18:52:37
 */

// import {
//   drawConnectors,
//   drawLandmarks,
// } from '@mediapipe/drawing_utils/drawing_utils';

// import {
//   ControlPanel,
//   FPS,
//   StaticText,
//   Slider,
//   Toggle
// } from '@mediapipe/control_utils/control_utils';

// import { Camera } from '@mediapipe/camera_utils/camera_utils';
// import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose/pose';
import {
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding,
  Scene,
  SpotLight,
  HemisphereLight,
  AmbientLight,
  OrthographicCamera,
  DoubleSide,
  Mesh,
  TextureLoader,
  MeshStandardMaterial,
  AxesHelper,
} from '../../third_party/three.module.js'
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js"
import { FaceMeshFaceGeometry } from '../../js/face.js'

const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
// const canvasCtx = canvasElement.getContext('2d');

// 3D模型配置
const modelConfig = {
  'cat_eye_glasses': { // 眼镜
    offsetX: 0,
    offsetY: -.1,
    offsetZ: 80,
    scalar: 80,
    filename: 'scene',
  },
  'catwoman_mask': { // 黑面具
    offsetX: -.1,
    offsetY: -2,
    offsetZ: 80,
    scalar: 8,
    filename: 'scene',
  },
  'rabbit_ears': { // 兔耳朵
    offsetX: 0,
    offsetY: 20,
    offsetZ: 10,
    scalar: 10,
    filename: 'scene',
  },
  'social_mask': { // 花纹面具
    offsetX: -.5,
    offsetY: -2,
    offsetZ: 30,
    scalar: 120,
    filename: 'social_mask',
  },
  'christmas_deer_horns': { // 鹿角
    offsetX: 0,
    offsetY: 5,
    offsetZ: -80,
    scalar: 120,
    filename: 'scene',
  },
  'mustache': { // 胡须
    offsetX: -1,
    offsetY: -8,
    offsetZ: 20,
    scalar: 5,
    filename: 'scene',
  },
};
const MODEL_NAME = 'cat_eye_glasses';
const MIRROR_VIDEO = true; // 是否镜像
let faceGeometry;

const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas: canvasElement });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputEncoding = sRGBEncoding;
const scene = new Scene();
const cameraT = new OrthographicCamera(1, 1, 1, 1, -1000, 1000);

/* 重新调整宽高 start */
let width = 0
let height = 0
window.addEventListener('resize', () => {
  resize();
});
resize();
/* 重新调整宽高 end */
renderer.render(scene, cameraT);

/* 基础面具 */
initFaceMaterial();


// 添加 3D 模型
const dynamicObj = await loadModel(`../../assets/3d/${MODEL_NAME}/${modelConfig[MODEL_NAME].filename}.gltf`, 'gltf');
scene.add(dynamicObj);

// 灯光
initLight();

/* 辅助 */
addAxes();

function onResults(results) {
  const landmarks = results.multiFaceLandmarks;
  if (landmarks) {
    if (width !== videoElement.videoWidth || height !== videoElement.videoHeight) {
      const w = videoElement.videoWidth
      const h = videoElement.videoHeight
      cameraT.left = -0.5 * w
      cameraT.right = 0.5 * w
      cameraT.top = 0.5 * h
      cameraT.bottom = -0.5 * h
      cameraT.updateProjectionMatrix()
      width = w
      height = h
      resize()
      faceGeometry.setSize(w, h)
    }
    const faces = calculateFaceMeshData(landmarks, videoElement.videoWidth, videoElement.videoHeight, MIRROR_VIDEO);
    faceGeometry.update(faces[0], MIRROR_VIDEO);
    const track = faceGeometry.track(6, 196, 419); //  10, 172, 397
    dynamicObj.position.copy(track.position)
    dynamicObj.position.x = dynamicObj.position.x + modelConfig[MODEL_NAME].offsetX * track.scale
    dynamicObj.position.y = dynamicObj.position.y + modelConfig[MODEL_NAME].offsetY * track.scale
    dynamicObj.position.z = dynamicObj.position.z + modelConfig[MODEL_NAME].offsetZ
    dynamicObj.rotation.setFromRotationMatrix(track.rotation) // .multiply(m)
    dynamicObj.scale.setScalar(track.scale * modelConfig[MODEL_NAME].scalar)
    renderer.render(scene, cameraT);
  }
  // canvasCtx.save();
  // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  // canvasCtx.drawImage(
  //     results.image, 0, 0, canvasElement.width, canvasElement.height);
  // if (results.multiFaceLandmarks) {
  //   for (const landmarks of results.multiFaceLandmarks) {
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
  //                     {color: '#C0C0C070', lineWidth: 1});
  //     drawConnectors(canvasCtx, landmarks, [[145, 153]], {color: '#FF3030'});
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
  //     drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
  //   }
  // }
  // canvasCtx.restore();
}

// 五官检测
const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  selfieMode: true,
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();

// 处理 mediapipe 的点位数据
function calculateFaceMeshData(multiFaceLandmarks, w, h, mirror) {
  let tmp = {
    scaledMesh: []
  }
  let len = multiFaceLandmarks[0].length;
  for (let i = 0; i < len; i++) {
    tmp.scaledMesh.push([multiFaceLandmarks[0][i].x * w * (mirror ? -1 : 1), multiFaceLandmarks[0][i].y * h, multiFaceLandmarks[0][i].z * 1200])
  }
  return [tmp]
}

// 加载模型
function loadModel( file, type ) {
  return new Promise( ( res, rej ) => {
      const loader = type === 'fbx' ? new FBXLoader() : new GLTFLoader();
      loader.load( file, function ( obj ) {
          res( obj.scene );
      }, undefined, function ( error ) {
          rej( error );
      } );
  });
}

function initLight() {
  const spotLight = new SpotLight(0xffffbb, 1);
  spotLight.position.set(0, 0, 1);
  spotLight.position.multiplyScalar(400);
  scene.add(spotLight);

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 200;
  spotLight.shadow.camera.far = 800;

  spotLight.shadow.camera.fov = 40;

  spotLight.shadow.bias = -0.001125;

  scene.add(spotLight);

  const hemiLight = new HemisphereLight(0xffffbb, 0x080820, 0.25);
  scene.add(hemiLight);

  const ambientLight = new AmbientLight(0x404040, 0.25);
  scene.add(ambientLight);
}

function addAxes() {
  const axesHelper = new AxesHelper(250);
  scene.add(axesHelper);
}

function initFaceMaterial() {
  const colorTexture = new TextureLoader().load('../../assets/alpha_mask.png');
  const aoTexture = new TextureLoader().load('../../assets/ao.jpg');
  const alphaTexture = new TextureLoader().load('../../assets/mask.png');

  const material = new MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.1,
    alphaMap: alphaTexture,
    aoMap: aoTexture,
    map: colorTexture,
    roughnessMap: colorTexture,
    // transparent: true,
    side: DoubleSide,
    opacity: 1,
    // polygonoffset: true,
    premultipliedAlpha: true
    // wireframe: true,
  })

  faceGeometry = new FaceMeshFaceGeometry({
    normalizeCoords: true,
  });
  const mask = new Mesh(faceGeometry, material);
  mask.receiveShadow = mask.castShadow = true;
  scene.add(mask);
}

function resize() {
  const videoAspectRatio = width / height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const windowAspectRatio = windowWidth / windowHeight;
  let adjustedWidth;
  let adjustedHeight;
  if (videoAspectRatio > windowAspectRatio) {
    adjustedWidth = windowWidth;
    adjustedHeight = windowWidth / videoAspectRatio;
  } else {
    adjustedWidth = windowHeight * videoAspectRatio;
    adjustedHeight = windowHeight;
  }
  renderer.setSize(width, height);
}