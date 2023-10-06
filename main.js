import * as THREE from './node_modules/three/build/three.js'
import { gsap } from "gsap";
import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js'
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { AfterimagePass } from './node_modules/three/examples/jsm/postprocessing/AfterimagePass.js'
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'
// import { ShaderPass } from './node_modules/three/examples/jsm/postprocessing/ShaderPass.js'
// import { PixelShader } from 'https://cdn.skypack.dev/pin/three@v0.124.0-SiHM7gHpytK81EPs3fGV/mode=imports,min/unoptimized/examples/jsm/shaders/PixelShader.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js'


var renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    antialias: true,
})

// default bg canvas color
renderer.setClearColor(0x11151c);

// use device aspect ratio
renderer.setPixelRatio(window.devicePixelRatio)

// set size of canvas within window
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();

const hdrEquirect = new RGBELoader()
    .setPath('https://miroleon.github.io/daily-assets/')
    .load('gradient_13.hdr', function () {

        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    });

scene.environment = hdrEquirect;
scene.fog = new THREE.Fog(0x11151c, 1, 100);
scene.fog = new THREE.FogExp2(0x11151c, 0.14);


var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 10;
camera.position.y = 0.2;


const pointlight = new THREE.PointLight(0xcc8585, 2, 20);
pointlight.position.set(0, 3, 2);
// scene.add(pointlight);

const pointlight2 = new THREE.PointLight(0xcc8585, 2, 20);
pointlight2.position.set(0, 3, 2);
scene.add(pointlight2);


document.addEventListener("mousemove", followLight, false);

let mouse = {
    x: 0,
    y: 0
};
function followLight(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    gsap.to(pointlight2.position, {
        x: mouse.x * 4,
        y: mouse.y * 2,
        delay: 0.1
    })
}

const textureLoader = new THREE.TextureLoader();

var surf_imp = textureLoader.load('./surf_imp_02.jpg');
surf_imp.wrapT = THREE.RepeatWrapping;
surf_imp.wrapS = THREE.RepeatWrapping;

var mask_mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 1,
    roughnessMap: surf_imp
});

let mask;

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading files' + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
    console.log('Loading complete!');
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    if (itemsLoaded === itemsTotal) {
        requestAnimationFrame(animate);

    }
};

manager.onError = function (url) {
    console.log('There was an error loading');
};


const loaderFBX1 = new FBXLoader(manager).setPath('./');
loaderFBX1.load('MASK_02.fbx', function (object) {

    mask = object.children[0];
    mask.position.set(0, 0.5, 0);
    mask.scale.setScalar(3);
    mask.material = mask_mat;
    scene.add(mask);
});





// POST PROCESSING
let composer;
const renderScene = new RenderPass(scene, camera);

const afterimagerPass = new AfterimagePass();
afterimagerPass.uniforms['damp'].value = 0.95;

const bloomparams = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0.1,
    bloomRadius: 1
}

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
);

bloomPass.threshold = bloomparams.bloomThreshold;
bloomPass.strength = bloomparams.bloomStrength;
bloomPass.radius = bloomparams.bloomRadius;



composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(afterimagerPass);
composer.addPass(bloomPass);






// RESIZE
window.addEventListener('resize', onWindowResize);

var theta1 = 0;

var update = function () {
    theta1 += 0.007;

    camera.position.x = Math.sin(theta1) * 2;
    camera.position.y = 2.5 * Math.cos(theta1) + 1;

    pointlight.position.x = Math.sin(theta1 + 1) * 11;
    pointlight.position.z = Math.cos(theta1 + 1) * 11;
    pointlight.position.y = 2 * Math.cos(theta1 - 3) + 3;

    // pointlight2.position.x = -Math.sin(theta1 + 1) * 11;
    // pointlight2.position.z = -Math.cos(theta1 + 1) * 11;
    // pointlight2.position.y = 2 * -Math.cos(theta1 - 3) - 6;

    camera.lookAt(0, 0, 0);

    mask.position.y = Math.sin(theta1) / 2;

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    update();
    composer.render();
    requestAnimationFrame(animate);
}









