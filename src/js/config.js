import * as THREE from "./libs/three.module.js";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OrbitControls } from "./libs/OrbitControls.js";
import { scoreMeshData } from "./data.js";
import image from "../assets/player.png";
// import {onWindowResize} from './resize.js'
let init, modelLoad;
// let gltfpath = "assets/cricket_stadium3.gltf";
// let stadium = "assets/GROUND_CRICKET.glb";
// let stadium = "assets/CG2.gltf";
const gltfpath = new URL(
  "../../public/models/cricket4stadium3.gltf",
  import.meta.url
).href;
const stadiumModel = new URL("../../public/models/CG2.gltf", import.meta.url)
  .href;
let texLoader = new THREE.TextureLoader();
const texloader2 = new THREE.TextureLoader();
// const group = new THREE.Group();

//for line
function getPointBeyondTerminal(
  initialX,
  initialY,
  initialZ,
  terminalX,
  terminalY,
  terminalZ,
  distance
) {
  let dx = terminalX - initialX;
  let dy = terminalY - initialY;
  let dz = terminalZ - initialZ;

  let norm = Math.sqrt(dx * dx + dy * dy + dz * dz);
  let nx = dx / norm;
  let ny = dy / norm;
  let nz = dz / norm;

  let pointX = terminalX + distance * nx;
  let pointY = terminalY + distance * ny;
  let pointZ = terminalZ + distance * nz;

  return [pointX, pointY, pointZ];
}

//gltf loader function
const loadGLTF = (path) => {
  return new Promise((resolve, reject) => {
    let manager = new ZapparThree.LoadingManager();
    const loader = new GLTFLoader(manager);
    loader.load(path, (gltf) => {
      resolve(gltf);
    });
  });
};

let _runStore = [];
// runs (61,47,-55 ),sixes (61,47,-10 ), fours(61,60.9,-55) runball(61,60.9,-10)
$(document).ready(function () {
  const start = async () => {
    if (ZapparThree.browserIncompatible()) {
      ZapparThree.browserIncompatibleUI();
      throw new Error("Unsupported browser");
    }

    let detect = detectWebGL();
    if (detect == 1) {
      init = new sceneSetup(70, 1, 1000, 70, 150, 70); //100,100,50

      // creating models

      //stadium model
      const stadium = await loadGLTF(stadiumModel);

      let mesh2 = stadium.scene;
      mesh2.scale.set(0.02, 0.02, 0.02);
      // mesh2.scale.set(0.1, 0.1, 0.1);
      // mesh2.rotation.y = Math.PI / 2.5;
      mesh2.name = "stadium";
      // mesh2.rotation.x = Math.PI / 10;
      //change the y axis to set for mobile screen
      // mesh2.position.set(0, -10, 50);
      // mesh2.position.set(53, 0, -48.5);
      init.instantTrackerGroup.add(mesh2);

      let point = new THREE.PointLight(0xffffff, 1.2);
      point.position.set(50.066, 100, -49.5);
      init.instantTrackerGroup.add(point);

      const player = await loadGLTF(gltfpath);
      let playerMesh = player.scene;
      playerMesh.traverse((child) => {
        if (child.type === "Mesh") {
          if (child.name === "playerImage") {
            child.material = new THREE.MeshBasicMaterial({
              // map:texLoader.load('tex/1234.png'),
              transparent: true,
              opacity: 1,
              depthTest: false,
              combine: THREE.MixOperation,
              side: THREE.DoubleSide,
            });
            child.visible = false;
          }
        }
      });
      playerMesh.scale.set(30, 30, 30); //11.5

      playerMesh.position.set(-140, -43, 50);
      playerMesh.name = "path";

      let test2 = init.instantTrackerGroup.getObjectByName("stadium");

      test2.add(playerMesh);

      //Player bg pic texture

      // const playerbg = await loadGLTF(gltfpath);
      // let playerMeshbg = playerbg.scene;
      // playerMeshbg.traverse((child) => {
      //   if (child.type === "Mesh") {
      //     if (child.name === "playerImage") {
      //       child.name = "playerImagebg";
      //       child.material = new THREE.MeshBasicMaterial({
      //         // map:texLoader.load('tex/1234.png'),
      //         transparent: true,
      //         opacity: 1,
      //         depthTest: false,
      //         combine: THREE.MixOperation,
      //         side: THREE.DoubleSide,
      //       });
      //       child.visible = false;
      //     }
      //   }
      // });
      // playerMeshbg.scale.set(50, 50, 50); //11.5

      // playerMeshbg.position.set(-140, -43, 10);
      // playerMeshbg.name = "path2";

      const playerTexture = new THREE.TextureLoader().load(image);
      // playerTexture.wrapS = playerTexture.wrapT = THREE.RepeatWrapping;
      // playerTexture.repeat.set(10000, 10000);
      // playerTexture.anisotropy = 16;
      // playerTexture.encoding = THREE.sRGBEncoding;
      playerTexture.wrapT = THREE.RepeatWrapping;
      playerTexture.repeat.y = -1;
      const playerMaterial = new THREE.MeshStandardMaterial({
        map: playerTexture,
        transparent: true,
        opacity: 1,
        depthTest: false,
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
        visible: true,
      });

      const playerMeshbg = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(29.6, 30.4),
        playerMaterial
      );
      let poin2 = new THREE.PointLight(0xffffff, 1.2);
      poin2.position.set(50.066, 100, -49.5);
      playerMeshbg.add(poin2);
      playerMeshbg.scale.set(4, 4, 4); //11.5
      playerMeshbg.rotation.z = Math.PI;

      playerMeshbg.rotation.y = -Math.PI / 1.044;
      playerMeshbg.position.set(0, 100, -80);
      playerMeshbg.name = "playerBg";
      // we set it first true and then false as it needs to get rendered once for the visibility to work.
      playerMeshbg.visible = false;
      let test3 = init.instantTrackerGroup.getObjectByName("stadium");

      test3.add(playerMeshbg);

      //FOR SCORE MESH LOADING

      scoreMeshData.map((data) => {
        //  console.log(data);

        let material = new THREE.MeshBasicMaterial({
          // transparent: true,

          opacity: 0.2,
          side: THREE.DoubleSide,
        });
        //adding bordered geometry

        let x = data.x;
        let y = data.y;
        let width = data.scaleX;
        let height = data.scaleY;
        let radius = 5;

        let shape = new THREE.Shape();
        shape.moveTo(x, y + radius);
        shape.lineTo(x, y + height - radius);
        shape.quadraticCurveTo(x, y + height, x + radius, y + height);
        shape.lineTo(x + width - radius, y + height);
        shape.quadraticCurveTo(
          x + width,
          y + height,
          x + width,
          y + height - radius
        );
        shape.lineTo(x + width, y + radius);
        shape.quadraticCurveTo(x + width, y, x + width - radius, y);
        shape.lineTo(x + radius, y);
        shape.quadraticCurveTo(x, y, x, y + radius);

        let geometry = new THREE.ShapeGeometry(shape);
        // if ((data.name = "profile")) {
        //   material.color = new THREE.Color(0x000);
        // } else {
        //   material.color = new THREE.Color(0xffffff);
        // }
        // const geometry = new THREE.PlaneGeometry(data.scaleX, data.scaleY);
        let planeScore = new THREE.Mesh(geometry, material);
        // // init.instantTrackerGroup.add(planeScore);
        // console.log(data.name, "checinvgcavci", planeScore.material);
        planeScore.name = "score_" + data.name;
        // if (data.name == "profile") {
        //   planeScore.material.color.setHex(0x000000);
        // } else {
        // planeScore.material.color.getHex(0xffffff);
        // }
        planeScore.position.set(data.x - 50, data.y - 10, data.z);
        // planeScore.scale.set(0.1, 0.1, 0.1);
        planeScore.rotation.set(0, Math.PI * 2, 0);
        // console.log("checkl", planeScore);
        planeScore.visible = false;
        // // init.instantTrackerGroup.add(group);
        // console.log('pppppp--->',init.instantTrackerGroup.children[2]);
        // init.instantTrackerGroup.traverse((child)=>{

        //   console.log(child);
        // })

        let test = init.instantTrackerGroup.getObjectByName("stadium");
        // let test2 = test.getObjectByName("path");
        // console.log("STADIUM,,,,-->", test2, planeScore);
        test.add(planeScore);
        // console.log(init.instantTrackerGroup);
      });

      //   modelLoad.groundRef();
    } else if (detect == 0) {
      alert("PLEASE ENABLE WEBGL IN YOUR BROWSER....");
    } else if (detect == -1) {
      alert(detect);
      alert("YOUR BROWSER DOESNT SUPPORT WEBGL.....");
    }
  };
  start();
});
function drawWagonWheels(xVal, yVal, color, name) {
  // console.log("lneee.....");
  var numPoints = 100;
  var start = new THREE.Vector3(51, 0, -45);
  // var middle = new THREE.Vector3(38, 0,-50);
  // var middle = new THREE.Vector3(38, 0, -55);
  // var end = new THREE.Vector3(yVal, 0, -xVal);
  let end = new THREE.Vector3(yVal, 0, -xVal);

  const newCord = getPointBeyondTerminal(51, 0, -45, yVal, 0, -xVal, 20);

  if (color == "0x4D5BFF") {
    end.x = newCord[0];
    end.y = 0;
    end.z = newCord[2];
  }
  let points = [];
  for (let i = 0; i <= 50; i++) {
    let p = new THREE.Vector3().lerpVectors(start, end, i / 50);
    if (color == "0xFF1F1F") {
      p.y = p.y + 10 * Math.sin((Math.PI * i) / 50);
    } else {
      p.y = p.y + 0.2 * Math.sin((Math.PI * i) / 50);
    }
    points.push(p);
  }
  let curve = new THREE.CatmullRomCurve3(points);
  // var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

  var tube = new THREE.TubeGeometry(curve, numPoints, 0.5, 50, false);
  var mesh = new THREE.Mesh(
    tube,
    new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    })
  );
  // const stad = group.getObjectByName("stadium");
  // group.add(mesh);
  let test = init.instantTrackerGroup.getObjectByName("stadium");
  test.add(mesh);
  // console.log(test);

  // console.log("heree", test, mesh);
  mesh.scale.set(1.33, 1.33, 1.33);
  mesh.position.set(-66, 8, 48);
  // mesh.position.set(-7, 5, -5);
  // mesh.rotation.x = Math.PI / 7;
  mesh.name = "WagonWheels_" + name;
  mesh.material.color.setHex(color);
  _runStore.push(mesh);
}

var PIXEL_RATIO = (function () {
  var ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
  return dpr / bsr;
})();

let createRetinaCanvas = function (w, h, ratio) {
  if (!ratio) {
    ratio = PIXEL_RATIO;
  }
  var can = document.createElement("canvas");
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
};

function scoreDisplay(data, name, size, right, rightCan) {
  let text;
  if (name === "runball") {
    text = data.runs + " RUNS" + " (" + data.balls + "balls)";
  } else if (name === "runs") {
    text = ` 1's + 2's + 3's =${
      data.run_details["ones"] +
      data.run_details["twos"] +
      data.run_details["threes"]
    }`;
  } else if (name === "fours") {
    text = "4's-" + data.run_details["fours"];
  } else if (name === "sixes") {
    text = "6's'-" + data.run_details["sixes"];
  } else if (name === "profile") {
    text = data.name;
  }
  //create image
  let bitmap = createRetinaCanvas(rightCan, 65); //300 ,65
  let ctx = bitmap.getContext("2d", { antialias: false });
  ctx.font = "Bold " + size + "px Goldman sans"; //50 for six
  // ctx.beginPath();
  // ctx.rect(0, 0, 300, 65);
  // ctx.fillStyle = 'rgba(255,255,255,.3)'

  // To change the color on the rectangle, just manipulate the context
  // ctx.strokeStyle = "rgb(255, 255, 255)";
  // ctx.lineWidth = 3;
  // ctx.fillStyle = "rgba(255,255,255, 1)";
  // ctx.beginPath();
  // ctx.roundRect(0, 5, 290, 58, 10);
  // ctx.stroke();
  // ctx.fill();
  if (name === "profile") {
    ctx.fillStyle = "#ACA08D";
  } else {
    ctx.fillStyle = "white";
  }
  // ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fill();
  ctx.fillText(text, right, 45); //150 ,40
  console.log(ctx, text);
  var texture = new THREE.Texture(bitmap);
  texture.needsUpdate = true;
  let _SM = init.instantTrackerGroup.getObjectByName("score_" + name);
  console.log(_SM, "sm here");
  _SM.material.map = texture;
  _SM.visible = true;
  console.log(_SM.material.map, ctx.fillText(text, right, 45));
}
export const displayRunMesh = (data) => {
  let _displayPlayerMesh =
    init.instantTrackerGroup.getObjectByName("playerImage");

  _displayPlayerMesh.material.map = texLoader.load(
    data.player_image,
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // Function called when download errors
    function (xhr) {
      console.log("An error happened");
    }
  );
  _displayPlayerMesh.needsUpdate = true;
  _displayPlayerMesh.visible = true;
  console.log(_displayPlayerMesh);

  //loading bg

  let bg = init.instantTrackerGroup.getObjectByName("playerBg");
  bg.visible = true;

  console.log(bg);

  scoreDisplay(data, "runball", 30, 150, 300);
  scoreDisplay(data, "runs", 35, 150, 300);
  scoreDisplay(data, "sixes", 45, 150, 300);
  scoreDisplay(data, "fours", 45, 150, 300);
  scoreDisplay(data, "profile", 50, 100, 300);
};

function detectWebGL() {
  // Check for the WebGL rendering context
  if (!!window.WebGLRenderingContext) {
    var canvas = document.createElement("canvas"),
      names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
      context = false;

    for (var i in names) {
      try {
        context = canvas.getContext(names[i]);
        if (context && typeof context.getParameter === "function") {
          // WebGL is enabled.
          return 1;
        }
      } catch (e) {}
    }

    // WebGL is supported, but disabled.
    return 0;
  }

  // WebGL not supported.
  return -1;
}
let material = {
  cube: new THREE.MeshLambertMaterial({
    //   map:THREE.ImageUtils.loadTexture("assets/Road texture.png"),
    color: 0xff0000,
    combine: THREE.MixOperation,
    side: THREE.DoubleSide,
  }),
};
class sceneSetup {
  constructor(FOV, near, far, x, y, z, ambientColor) {
    this.container = document.getElementById("canvas");
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.cameraMain = new ZapparThree.Camera();
    ZapparThree.permissionRequestUI().then((granted) => {
      if (granted) this.cameraMain.start();
      else ZapparThree.permissionDeniedUI();
    });
    this.hasPlaced = false;
    this.placeButton = document.getElementById("tap-to-place");
    this.placeButton.addEventListener("click", () => {
      this.hasPlaced = true;
      this.placeButton.remove();
    });

    ZapparThree.glContextSet(this.renderer.getContext());
    this.instantTracker = new ZapparThree.InstantWorldTracker();
    this.instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
      this.cameraMain,
      this.instantTracker
    );
    this.scene.add(this.instantTrackerGroup);
    this.instantTrackerGroup.position.set(0, 2, 5);
    // console.log(this.cameraMain, this.instantTrackerGroup, this.scene);
    this.addingCube();

    // this.camera(FOV, near, far, x, y, z);
    this.ambientLight(ambientColor);
    this.render();

    // console.log(this.cameraMain);
    this.rendering();

    // this.cameraMain.lookAt(this.camPoint);
  }

  rendering() {
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight
    );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // console.log(this.cameraMain);
    this.scene.background = this.cameraMain.backgroundTexture;

    // this.cameraMain.position.set(1000, 70, 150);
    // this.cameraMain.lookAt(0, 0, 0);
  }
  addingCube() {
    this.geo = new THREE.BoxBufferGeometry(2, 2, 2);
    this.mat = material.cube;
    this.camPoint = new THREE.Mesh(this.geo, this.mat);
    this.instantTrackerGroup.add(this.camPoint);
    this.camPoint.position.set(100, 0, -24);
    // this.axesHelper = new THREE.AxesHelper(15);
    // this.instantTrackerGroup.add(this.axesHelper);
  }
  ambientLight(ambientColor) {
    this.ambiLight = new THREE.AmbientLight(0xffffff);
    this.light = new THREE.HemisphereLight(0xd1d1d1, 0x080820, 1);
    // this.scene.add(this.ambiLight);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // console.log(this.cameraMain.position, this.instantTrackerGroup.position);

    if (!this.hasPlaced) {
      this.instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -8);
    }

    this.cameraMain.aspect =
      this.container.offsetWidth / this.container.offsetHeight;
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight
    );
    this.cameraMain._updateProjectionMatrix();
    // this.instantTrackerGroup.position.set(0, 0, 5);
    this.cameraMain.updateFrame(this.renderer);

    // this.controls.update();
    this.renderer.render(this.scene, this.cameraMain);
  }

  render() {
    this.animate();
  }
}
// const scoreDisplayMesh = () => {
//   scoreMeshData.map((data) => {
//     // console.log(data);
//     let material = new THREE.MeshBasicMaterial({
//       transparent: true,
//       opacity: 1,
//       side: THREE.DoubleSide,
//     });
//     const geometry = new THREE.PlaneGeometry(data.scaleX, data.scaleY);
//     let planeScore = new THREE.Mesh(geometry, material);
//     // init.instantTrackerGroup.add(planeScore);
//     planeScore.name = "score_" + data.name;
//     planeScore.position.set(data.x, data.y, data.z);
//     planeScore.rotation.set(0, Math.PI / 2, 0);
//     console.log("checkl", planeScore);
//     planeScore.visible = false;
//     // init.instantTrackerGroup.add(group);
//     let test = init.instantTrackerGroup.getObjectByName("stadium");
//     test.add(planeScore);
//     console.log(init.instantTrackerGroup);
//   });
// };
const onWindowResize = () => {
  init.cameraMain.aspect =
    init.container.offsetWidth / init.container.offsetHeight;
  init.renderer.setSize(
    init.container.offsetWidth,
    init.container.offsetHeight
  );
  init.cameraMain._updateProjectionMatrix();
};

window.addEventListener("resize", onWindowResize, false);

// class objLoad {
//   constructor() {}

//   Model() {
//     this.manager = new ZapparThree.LoadingManager();
//     this.loader = new GLTFLoader(this.manager);
//     this.loader.load(gltfpath, (gltf) => {
//       this.mesh = gltf.scene;
//       this.mesh.traverse((child) => {
//         if (child.type === "Mesh") {
//           if (child.name === "playerImage") {
//             child.material = new THREE.MeshBasicMaterial({
//               // map:texLoader.load('tex/1234.png'),
//               transparent: true,
//               opacity: 1,
//               depthTest: false,
//               combine: THREE.MixOperation,
//               side: THREE.DoubleSide,
//             });
//             child.visible = false;
//           }
//         }
//       });
//       this.mesh.scale.set(2, 2, 2); //11.5
//       this.mesh.position.set(-3, -11, 60);
//       this.mesh.name = "path";
//       this.mesh.rotation.y = Math.PI / 3;
//       // console.log(this.mesh.position);
//       init.instantTrackerGroup.add(this.mesh);
//       // this.mesh.lookAt(init.cameraMain);
//     });
//     this.loader.load(stadium, (gltf) => {
//       this.mesh2 = gltf.scene;
//       this.mesh2.scale.set(0.1, 0.1, 0.1);
//       this.mesh2.rotation.y = Math.PI / 2.5;
//       this.mesh2.name = "stadium";
//       // this.mesh2.rotation.x = Math.PI / 10;
//       this.mesh2.position.set(0, -20, 50);
//       // this.mesh2.position.set(53, 0, -48.5);
//       init.instantTrackerGroup.add(this.mesh2);
//     });
//     let point = new THREE.PointLight(0xffffff, 1.2);
//     point.position.set(50.066, 100, -49.5);
//     init.instantTrackerGroup.add(point);
//   }

//   groundRef() {
//     this.manager = new ZapparThree.LoadingManager();
//     this.loader = new GLTFLoader(this.manager);
//     this.loader.load("assets/groundRef.glb", (gltf) => {
//       this.mesh = gltf.scene;
//       this.mesh.scale.set(11.5, 11.5, 11.5);
//       init.instantTrackerGroup.add(this.mesh);
//     });
//   }
// }

//new code for running a gltf model

export const wagonWheel = (data) => {
  // _runStore.map((data) => {
  //   let _G = init.instantTrackerGroup.getObjectByName(data.name);
  //   let stad = init.instantTrackerGroup.getObjectByName("stadium");
  //   console.log(_G, "g here", stad.remove(data.name));
  //   _G.removeFromParent();
  //   // stad.remove(data.name);
  // });
  _runStore.map((data) => {
    let _G = init.instantTrackerGroup.getObjectByName(data.name);
    _G.removeFromParent();
  });
  _runStore = [];
  data.balls_details.map((data) => {
    console.log(data, "data");
    let _N, color;
    let _Wx = data.battingAnalysis.shots.wagonWheel.x;
    let _Wy = data.battingAnalysis.shots.wagonWheel.y;
    if (data.runsBat === 1) {
      _N = "Ones";
      color = "0xFFFFFF";
    } else if (data.runsBat === 2) {
      _N = "Twos";
      color = "0xFFE557";
    } else if (data.runsBat === 3) {
      _N = "Threes";
      color = "0xFFE557";
    } else if (data.runsBat === 4) {
      _N = "Fours";
      // let d = Math.sqrt(((_Wy - 51) ** 2 + (-_Wx + 45)) ** 2);
      // console.log(d);
      // let newX = _Wy - (30 * (_Wy - 51)) / d;
      // let newY = ((newX - 51) * (-_Wx + 25)) / (_Wy - 51);
      // console.log(_Wx, _Wy, newX, newY);

      // _Wx = newY;
      // _Wy = newX;
      color = "0x4D5BFF";
    } else if (data.runsBat === 6) {
      _N = "Sixes";
      color = "0xFF1F1F";
    }

    // console.log(data.battingAnalysis, _Wx, _Wy);

    drawWagonWheels(_Wx, _Wy, color, _N);
  });
};
export const displayLines = (data) => {
  if (data !== "all") {
    let _P = "WagonWheels_" + data;
    _runStore.map((data) => {
      data.name === _P ? (data.visible = true) : (data.visible = false);
    });
  } else {
    _runStore.map((data) => {
      data.visible = true;
    });
  }
};
