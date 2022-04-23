import * as THREE from 'three';
import Ia from './thinkia'
import $ from 'jquery'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {OBJLoader} from './OBJLoader.js';
import {MTLLoader} from './MTLLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

var selectedObjects = [];
var camera, controls, scene, renderer, stats, geometry, composer, mouse, raycaster, vector3,
    dirLight, video, outlinePass, renderScene, notSelected, cameraPostionStart, bloomComposer, bloomPass, finalPass,
    container, buffers, canvas, mixer, selectedObject, selectedObjectOld, labelRenderer, houseLabel, labelControls,
    matLineXi, matLineZhong, matLineCu;
var flag = true, selectFlag = false;
var textureLoader = new THREE.TextureLoader();
var clock = new THREE.Clock();
var width = window.innerWidth, height = window.innerHeight;

var times = 0;
var ia = Ia();
var iaWorld = ia.world;
ia.colorful.useSimplePoint(3);
var lineInfo = [], colors = [], positions = [];
var drawPoint = function(){};
var publicPath = process.env.BASE_URL

console.log(process.env.BASE_URL,"路径")

// 辉光参数配置
const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
var bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({color: "black"});
const materials = {};
const params = {
    exposure: 1,
    bloomStrength: 0.1,
    bloomThreshold: 0,
    bloomRadius: 0
};

////// 执行主函数
// init();
// animate();


/**
 * 事件
 *
 *  */
window.addEventListener('click', onDocumentMouseClick, false);
window.addEventListener('dblclick', function () {
    flag = true;
});
window.onresize = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
    bloomComposer.setSize(width, height);
    composer.setSize(width, height);

    renders();
};
// document.getElementById('btnSelect').onclick = function(){
//     selectFlag = false;
//     if(selectedObject){
//         selectedObject.layers.disableAll();
//         selectedObject.layers.toggle(ENTIRE_SCENE);
//         selectedObject = null;
//     }
//     document.getElementById('glcanvas').style.display = 'block';
//     $("#btnSelect").hide();
//     tweenAnimate(camera.position, cameraPostionStart);
//     if(notSelected.length > 0){
//         for (var i = 0; i < notSelected.length; i++) {
//             notSelected[i].visible = true;
//         }
//         notSelected = [];
//     // eslint-disable-next-line no-empty
//     }else {}
// };

/**
 * 主函数  -- 1（初始化）
 *
 * */
export function init() {
    //容器
    container = document.createElement('div');
    container.setAttribute('class','threeDiv')
    container.style.width = '100%';
    container.style.height = '100%';
    let boxThree = document.getElementById('BoxDD');
    boxThree.appendChild(container);

    //射线提取器
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    //搭建场景
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

    //相机初始化
    camera = new THREE.PerspectiveCamera(30, width/height, 1, 5000000);
    cameraPostionStart = new THREE.Vector3(1000, 500, 1000);
    camera.position.set(cameraPostionStart.x, cameraPostionStart.y, cameraPostionStart.z);

    light();//灯光
    stars();//星空

    labelRenderer = initLabelRender();//初始化标注渲染器
    renderer = initRender();//初始化场景渲染器
    container.appendChild(flowingLightCanvas());//div中添加流光画布
    var help = new THREE.GridHelper(16500, 150, '#060337', '#060337');
    help.position.set(0,-60,0);
    scene.add(help);
    controls = control();
    labelControls = getLabelControls();

    //正常渲染组合
    composer = new EffectComposer(renderer);
    renderScene = new RenderPass(scene, camera);
    outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    composer.addPass(renderScene);
    composer.addPass(outlinePass);

    //辉光通道
    bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    //辉光渲染组合
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    //正常通道
    finalPass = new ShaderPass(
        new THREE.ShaderMaterial( {
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: {value: bloomComposer.renderTarget2.texture}
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            defines: {}
        } ), "baseTexture"
    );
    finalPass.needsSwap = true;
    composer.addPass(finalPass);

    //线材质
    matLineXi = new MeshLineMaterial({lineWidth: 1, color: 'red'});
    matLineZhong = new MeshLineMaterial({lineWidth: 3, color: 'green'});
    matLineCu = new MeshLineMaterial({lineWidth: 4, color: 'blue'});

    var loaderObj = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load(process.env.BASE_URL+'/mode/louAll.mtl', function(materials) {
        materials.preload();
        loaderObj.setMaterials(materials);
        // loaderObj.setPath('/static/modelVanke/obj0401/');
        loaderObj.load(process.env.BASE_URL+'/mode/louAll.obj', function(object) {
            object.position.y = -20;
            object.scale.set(0.003,0.003,0.003);
            scene.add(object)
        });
    });
    $(".threeDiv").children().css({"width":"100%","height":"100%"});
    $(".threeDiv").children('div').addClass('fink');
    $(".threeDiv").children('canvas').addClass('canvasBook');
    renderer.domElement.addEventListener('pointermove', onPointerMove, false);
    labelRenderer.domElement.addEventListener('pointermove', onPointerMove, false);
}

////// 场景布置相关
/**
 * 获取标注容器 DIV
 * */
function getLabelDiv() {
    var earthDiv = document.createElement('div');
    earthDiv.className = 'label';
    earthDiv.style.marginTop = '-1em';
    earthDiv.style.width = '80px';
    earthDiv.style.textAlign = 'center';
    earthDiv.style.background = 'url("./pic/rectangle2.png") no-repeat  rgba(110, 87, 255,0.8)';
    earthDiv.style.backgroundSize = '100% 100%';
    earthDiv.style.color = 'rgb(255,154,200)';

    return earthDiv;
}

/**
 *  向目标物体中心位置添加label
 * */
function addLabel(selectedObjectMove) {
    var labelDiv = getLabelDiv();
    labelDiv.textContent = selectedObjectMove.name;
    houseLabel = new CSS2DObject(labelDiv);
    var targetVector = selectedObjectMove.geometry.boundingSphere.center;
    houseLabel.position.set(targetVector.x, targetVector.y, targetVector.z);
    selectedObjectMove.add(houseLabel);
}

/**
 * 闪烁高亮轮廓线
 * @param selectedObjects
 */
function outlineObj(selectedObjects){
    if(selectedObjects[0].name == 'lu1'){
        outlinePass.visibleEdgeColor.set('#808000');
    }else if(selectedObjects[0].name == 'lu2'){
        outlinePass.visibleEdgeColor.set('#806108');
    }else if(selectedObjects[0].name == 'Line09'){
        outlinePass.visibleEdgeColor.set('#008000'); // 高光颜色
    }else {
        outlinePass.visibleEdgeColor.set('blue');
    }
    outlinePass.pulsePeriod = 2; //数值越大，律动越慢
    // outlinePass.visibleEdgeColor.set(0xff0000); // 高光颜色
    outlinePass.hiddenEdgeColor.set(0x000000);// 阴影颜色
    outlinePass.usePatternTexture = false; // 使用纹理覆盖？
    outlinePass.edgeStrength = 3.5; // 高光边缘强度
    outlinePass.edgeGlow = 1; // 边缘微光强度
    outlinePass.edgeThickness = 2; // 高光厚度
    outlinePass.selectedObjects = selectedObjects; // 需要高光的obj
}

/**
 * 星空背景
 */
function stars() {
    const r = 6371, starsGeometry = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];
    const vertices1 = [];
    const vertices2 = [];
    const vertex = new THREE.Vector3();
    for (let i = 0; i < 500; i++) {
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);
        vertices1.push(vertex.x, vertex.y, vertex.z);
    }
    for (let i = 0; i < 1500; i++) {
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);
        vertices2.push( vertex.x, vertex.y, vertex.z );
    }
    starsGeometry[ 0 ].setAttribute('position', new THREE.Float32BufferAttribute(vertices1, 3));
    starsGeometry[ 1 ].setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));
    const starsMaterials = [
        new THREE.PointsMaterial( { color: '#fc6f2c', size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#ffefe7', size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#e7ecff', size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#c873ff', size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#0000ff', size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#fbf8ff', size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#dc6678', size: 1, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: '#d4dbdc', size: 3, sizeAttenuation: false } )
    ];
    for ( let i = 10; i < 300; i ++ ) {
        const stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar( i * 40 );
        stars.matrixAutoUpdate = false;
        stars.updateMatrix();
        scene.add(stars);
    }
}

/**
 * 场景灯光
 */
function light() {
    var point = new THREE.PointLight(0xf0f0f0);
    point.position.set(1000, 1000, 1000);
    point.lookAt(0,0,0);
    scene.add(point);
    var point2 = new THREE.PointLight(0xf0f0f0);
    point2.position.set(-1000, -1000, -1000);
    point2.lookAt(0,0,0);
    scene.add(point2);
    var point3 = new THREE.PointLight(0xf0f0f0);
    point3.position.set(-1000, 1000, -1000);
    point3.lookAt(0,0,0);
    scene.add(point3);
    var point4 = new THREE.PointLight(0xf0f0f0);
    point4.position.set(-1000, 1000, 1000);
    point4.lookAt(0,0,0);
    scene.add(point4);
}

/**
 * 初始化渲染器
 * @returns {WebGL1Renderer}
 */
function initRender() {
    renderer = new THREE.WebGLRenderer({
        antialias: true, //抗锯齿
        // alpha: true,
        // preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
    document.body.appendChild(renderer.domElement);// body中插入canvas对象
    container.appendChild(renderer.domElement); //控制流光画布是否添加到div
    return renderer;
}

/**
 *初始化标注渲染器
 * */
function initLabelRender() {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);
    container.appendChild(labelRenderer.domElement);
    return labelRenderer;
}

/**
 * 流光画布
 * @returns {HTMLCanvasElement}
 */
function flowingLightCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';
    canvas.className = 'glcanvas';
    return canvas;
}

/**
 * 初始化控制器
 * @returns {OrbitControls}
 */
function control() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.2; //旋转速度
    controls.zoomSpeed = 2.5; //缩放速度
    controls.autoRotateSpeed = 0.0005;
    controls.maxDistance = 80000;
    controls.minDistance = 0;
    controls.maxPolarAngle = Math.PI*0.4;//控制视角俯仰角度
    return controls;
}

/**
 * 初始化标注控制器
 * */
function getLabelControls() {
    labelControls = new OrbitControls(camera, labelRenderer.domElement);
    labelControls.rotateSpeed = 0.2; //旋转速度
    labelControls.zoomSpeed = 2.5; //缩放速度
    labelControls.autoRotateSpeed = 0.5;
    labelControls.maxDistance = 80000;
    labelControls.minDistance = 0;
    labelControls.maxPolarAngle = Math.PI * 0.4;//控制视角俯仰角度
    return labelControls;
}

////// 循环视角相关
/**
 * 主函数 -- 2（循环动画）
 */
export function animate() {
    controls.autoRotate = true;
    labelControls.autoRotate = true;
    labelRenderer.render(scene, camera);
    if(!flag) {
        controls.autoRotate = false;
        labelControls.autoRotate = false;
    }
    raycaster.setFromCamera(mouse, camera);
    const delta = clock.getDelta();
    controls.update(delta);
    labelControls.update(delta);
    TWEEN.update();
    // composer.render(delta);
    renders();
    for (let i = 0; i < ia.view.mat4.length; i++) {
        ia.view.mat4[i] = camera.matrixWorldInverse.elements[i];
        ia.eyes.mat4[i] = camera.projectionMatrix.elements[i];
    }
    drawPoint();
    requestAnimationFrame(animate);
}

/**
 * 平滑相机
 * */
function tweenAnimate(positionA, positionB) {
    new TWEEN.Tween(positionA).to(positionB, 1800).onUpdate(function (pos){
        controls.enabled = false;
    }).onComplete(function() {
        controls.enabled = true;
        if(vector3){
            camera.lookAt(vector3);
        }
    }).easing(TWEEN.Easing.Cubic.InOut).start();
}

////// 辉光渲染相关
/**
 * 组合渲染
 * */
function renders() {
    bloomComposer.renderToScreen = false;
    renderBloom(true);
    composer.render();
}

/**
 * 渲染辉光
 * */
function renderBloom(mask) {
    if (mask === true) {
        scene.traverse(darkenNonBloomed);
        bloomComposer.render();
        scene.traverse(restoreMaterial);
    } else {
        camera.layers.set(BLOOM_SCENE);
        bloomComposer.render();
        camera.layers.set( ENTIRE_SCENE );
    }

}

/**
 * 移除辉光
 * */
function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}

/**
 * 材质重置
 * */
function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}

////// 射线提取相关
/**
 * 鼠标移动--射线提取--标注添加
 * */
function onPointerMove(event) {
    // flag = false;
    if (event.isPrimary === false) return;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    checkIntersection();
}
function checkIntersection() {
    var intersects = raycaster.intersectObject(scene,true);
    if (intersects.length > 0) {
        var selectedObjectMove = intersects[0].object;
        addSelectedObject(selectedObjectMove);
        outlinePass.selectedObjects = selectedObjects;
        outlineObj(selectedObjects);
    } else {
        outlinePass.selectedObjects = [];
        if(selectedObjects.length > 0){
            selectedObjectOld = selectedObjects[0];
            selectedObjectOld.remove(houseLabel);
        }
    }
}
function addSelectedObject(selectedObjectMove) {
    if(selectedObjects){
        selectedObjectOld = selectedObjects[0];
    }
    if(houseLabel){
        selectedObjectOld.remove(houseLabel);
    }

    selectedObjects = [];
    selectedObjects.push(selectedObjectMove);

    if(selectedObject){
        if(selectedObject == selectedObjectMove){
            addLabel(selectedObjectMove);
        }
    }else {
        if(selectedObjectMove.isMesh){
            addLabel(selectedObjectMove);
        }
    }

}

/**
 * 鼠标点击--射线提取
 * */
function onDocumentMouseClick( event ) {
    flag = false;
    if (event.isPrimary === false) return;
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // checkIntersectionClick();
    var intersects = raycaster.intersectObject(scene, true);
    if(intersects.length > 0){
        if(intersects[0].object.name == '1861'){
            window.location.href='http://upvr.net/index.php/Product/Index/index/id/140822'
        }
    }
}
function checkIntersectionClick(){
    if(!selectFlag){
        notSelected = [];
        var intersects = raycaster.intersectObject(scene,true);
        if (intersects.length > 0) {
            document.getElementById('glcanvas').style.display = 'none';
            selectedObject = intersects[0].object;
            selectedObject.layers.toggle(BLOOM_SCENE);
            renders();

            var objs = scene.children;
            $("#btnSelect").show();
            for (var l = 0; l < objs.length; l++) {
                if(objs[l].type == 'Group'){
                    for (var i = 0; i < objs[l].children.length; i++) {
                        if(selectedObject.name != objs[l].children[i].name){
                            notSelected.push(objs[l].children[i]);
                            objs[l].children[i].visible = false;
                        }else {
                            objs[l].children[i].geometry.computeBoundingBox();
                            vector3 = objs[l].children[i].geometry.boundingBox.getCenter(new THREE.Vector3());
                            // console.log(objs[l].children[i].geometry.boundingBox.getCenter(new THREE.Vector3()))
                            if(vector3.y>0){
                                if(vector3.z<0){
                                    if(vector3.x>0){
                                        tweenAnimate(camera.position, new THREE.Vector3(vector3.x*2, vector3.y*6,
                                            -vector3.z*70))
                                    }else if(vector3.x<0){
                                        tweenAnimate(camera.position, new THREE.Vector3(-vector3.x*2, -vector3.y*3,
                                            -vector3.z*90));
                                    }
                                }else if(vector3.z>0){
                                    if(vector3.x>0){
                                        if(vector3.x>10){
                                            tweenAnimate(camera.position, new THREE.Vector3(vector3.x*30, vector3.y*5,
                                                vector3.z+1200));
                                        }else {
                                            tweenAnimate(camera.position, new THREE.Vector3(vector3.x*5, vector3.y*5,
                                                vector3.z+1200));
                                        }
                                    }else if(vector3.x<0){
                                        tweenAnimate(camera.position, new THREE.Vector3(-vector3.x*30, vector3.y*5,
                                            vector3.z+1200));
                                    }
                                }
                            }else if(vector3.x=vector3.y=vector3.z == 0){
                                tweenAnimate(camera.position, new THREE.Vector3(1500, 800,
                                    1800));
                            }
                            camera.updateProjectionMatrix();
                        }
                    }
                }
            }
            selectFlag = true;
        } else {}
    }
}
