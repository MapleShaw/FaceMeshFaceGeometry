/*
 * @Descripttion: 
 * @version: X3版本
 * @Author: maplexiao
 * @Date: 2021-05-20 20:07:51
 * @LastEditors: maplexiao
 * @LastEditTime: 2021-05-26 17:59:22
 */

// https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/pose/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/hands/index.d.ts
// https://cdn.jsdelivr.net/npm/@mediapipe/holistic/index.d.ts

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

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  console.log('=====results=====', FACEMESH_RIGHT_EYE, results)
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                      {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, [[145, 153]], {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
    }
  }
  // 识别结果保存在multiHandLandmarks和multiHandedness对象中，如果这两个对象不为null，则说明识别成功
  // if (results.multiHandLandmarks && results.multiHandedness) {
  //   // 遍历multiHandLandmarks，获得每个hand的信息
  //   for (let index = 0; index < results.multiHandLandmarks.length; index++) {
  //     const classification = results.multiHandedness[index];
  //     const isRightHand = classification.label === 'Right';
  //     // 一个手的关节信息
  //     const landmarks = results.multiHandLandmarks[index];

  //     // 绘制手部拓扑图
  //     drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' });
  //     drawLandmarks(canvasCtx, landmarks, { color: isRightHand ? '#00FF00' : '#FF0000', fillColor: isRightHand ? '#FF0000' : '#00FF00',
  //       radius: (x) => {
  //         return lerp(x.from.z, -0.15, .1, 10, 1);
  //       }
  //     });
  //   }
  // }
  canvasCtx.restore();
}

// 五官检测
const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// 手掌检测 https://gitee.com/davie/air-war-with-hand/tree/master#https://davie.gitee.io/air-war-with-hand
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3/${file}`;
  }
});
hands.setOptions({
  selfieMode: true, //是否自拍，即是否使用前置摄像头
  maxNumHands: 2,  //最大识别手部数量
  minDetectionConfidence: 0.5,  //识别精度，这个数值越高，则要求图像高评分才能被识别 默认 0.5
  minTrackingConfidence: 0.5 //跟踪速度，数值越高，花费时间越长
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
    // await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();