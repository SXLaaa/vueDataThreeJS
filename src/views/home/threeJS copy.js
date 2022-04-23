    import * as THREE from 'three';
    import Ia from './thinkia'
    import $ from 'jquery'
    import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
    import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
    import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

    import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    
        var selectedObjects = [];
        var camera, controls, scene, renderer, composer, mouse, raycaster, vector3,
            outlinePass, renderScene, notSelected, cameraPostionStart, bloomComposer, bloomPass, finalPass,
            container, buffers, canvas, selectedObject;
        var flag = true, selectFlag = false;
        var clock = new THREE.Clock();
        var width = window.innerWidth, height = window.innerHeight;
    
        var ia = Ia();
        var iaWorld = ia.world;
        ia.colorful.useSimplePoint(3);
        var lineInfo = [], colors = [], positions = [];
        var drawPoint = function () {};
    
        // 辉光参数配置
        const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
        var bloomLayer = new THREE.Layers();
        bloomLayer.set(BLOOM_SCENE);
        const darkMaterial = new THREE.MeshBasicMaterial({color: "black"});
        const materials = {};
        const params = {
            exposure: 1,
            bloomStrength: 2.3,
            bloomThreshold: 0,
            bloomRadius: 0,
            scene: "Scene with Glow"
        };
    
        /**
         * 事件
         * */
        window.addEventListener('click', onDocumentMouseClick, false);
        window.addEventListener('dblclick', function () {
            flag = true;
        });
        window.onresize = function () {
    
            const width = window.innerWidth;
            const height = window.innerHeight;
    
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
    
            renderer.setSize( width, height );
    
            bloomComposer.setSize( width, height );
            composer.setSize( width, height );
    
            renders();
    
        };
       export function refit(){
            selectFlag = false;
            selectedObject.layers.disableAll();
            selectedObject.layers.toggle(ENTIRE_SCENE);
            document.getElementById('glcanvas').style.display = 'block';
            $("#btnSelect").hide();
            tweenAnimate(camera.position, cameraPostionStart);
            if(notSelected.length > 0){
                for (var i = 0; i < notSelected.length; i++) {
                    notSelected[i].visible = true;
                }
                notSelected = [];
            // eslint-disable-next-line no-empty
            }else {}
        }
    
        /**
         * 主函数  -- 1（初始化）
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
            renderer = initRender();
            // console.log(document.getElementsByTagName('canvas')[0])
            container.appendChild(flowingLightCanvas());//div中添加流光画布
            scene.add(new THREE.GridHelper(2500, 20, 'yellow', '#410041'));
            controls = control();
    
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
    
            var loaderObj = new OBJLoader();
            var mat4 = new THREE.MeshPhysicalMaterial({
                color: 0xc6d0c,
                emissive:0x94219,// emissive默认黑色
                emissiveMap: new THREE.TextureLoader().load("/static/textures/cube/Park2/posx.jpg"),
                roughness: 0.5,
                reflectivity: 0.2
            });
            var mat44 = new THREE.MeshPhysicalMaterial({
                color: 0x2194ce,
                emissive:0x94219,// emissive默认黑色
                emissiveMap: new THREE.TextureLoader().load("/static/textures/cube/Park3Med/px.jpg"),
                roughness: 0.5,
                reflectivity: 0.2
            });
            loaderObj.load('/static/modelVanKe/fxt/fxt.obj', function (object) {
                     object.traverse(function (child) {
                        if (child.isMesh) {
                            if(child.name != "yjfqtdx"){
                                 child.material = mat44;
                                 child.castShadow = true;
                                 child.receiveShadow = true;
                             }else {
                                child.material = mat4;
                                child.layers.toggle(BLOOM_SCENE);
                            }
                         }
                    });
                     object.position.y = -150;
                     object.scale.set(3.5, 3.5, 3.5);
                   scene.add(object);
                 }, function (xhr) {
                if (xhr.lengthComputable) {
                         var percentComplete = xhr.loaded / xhr.total * 100;
                         console.log(Math.round(percentComplete, 2) + '% downloaded');
                     }
            });
            loaderObj.load('/static/modelVanKe/light/line3.obj', function (object) {
                object.scale.set(10, 10, 10);
                for (let i = 0; i < object.children.length; i++) {
                    lineInfo[i] = {}
    
                    lineInfo[i].times = 0
                    lineInfo[i].colors = []
                    lineInfo[i].positions = []
    
                    lineInfo[i].pointsMod = []
                    if (object.children[i].name.includes('xi')) {
                        lineInfo[i].name = 'xi'
                        lineInfo[i].size = 2
                        lineInfo[i].color = [1.0, 0.549, 0.188, 1]
    
                    } else if (object.children[i].name.includes('zhong')) {
                        lineInfo[i].name = 'zhong'
                        lineInfo[i].size = 4
                        lineInfo[i].color = [0.266, 0.764, 1.0, 1]
                    } else if (object.children[i].name.includes('cu')) {
                        lineInfo[i].name = 'cu'
                        lineInfo[i].size = 8
                        lineInfo[i].color = [0.392, 1.0, 0.96, 1]
                    }
    
                    let vec3 = [];
                    let array = object.children[i].geometry.attributes.position.array;
                    let length = object.children[i].geometry.attributes.position.array.length / 3;
    
                    for (let j = 0; j < length; j++) {
                        //改位置
                        vec3.push(new THREE.Vector3(array[3 * j]*10, array[3 * j + 1]*10, array[3 * j + 2]*10))
                    }
                    let curve = new THREE.CatmullRomCurve3(vec3);
                    let points = curve.getPoints(100);
    
                    for (let k = 0; k < points.length - 1; k++) {
                        lineInfo[i].pointsMod.push(points[k])
                        let n;
                        let disTance = points[k].distanceTo(points[k + 1]);
                        if (disTance > 0.1) {
                            n = Math.floor(disTance)  //调长短
                            for (let m = 0; m < n; m++) {
                                let x = (points[k + 1].x - points[k].x) * m / n + points[k].x
                                let y = (points[k + 1].y - points[k].y) * m / n + points[k].y
                                let z = (points[k + 1].z - points[k].z) * m / n + points[k].z
                                lineInfo[i].pointsMod.push(new THREE.Vector3(x, y, z))
                            }
                        }
                    }
                    lineInfo[i].maxTimes = lineInfo[i].pointsMod.length
                }
                iaWorld.initIaWorld(false);
                // 开启混合，透明模式
                // iaWorld.blend2opacity()
    
                drawPoint = function () {
                    for (let i = 0; i < lineInfo.length; i++) {
                        lineInfo[i].times += 3
                        lineInfo[i].colors.push(lineInfo[i].color[0], lineInfo[i].color[1], lineInfo[i].color[2], lineInfo[i].color[3])
                        lineInfo[i].colors.push(lineInfo[i].color[0], lineInfo[i].color[1], lineInfo[i].color[2], lineInfo[i].color[3])
                        lineInfo[i].colors.push(lineInfo[i].color[0], lineInfo[i].color[1], lineInfo[i].color[2], lineInfo[i].color[3])
    
                        lineInfo[i].positions.push(lineInfo[i].pointsMod[lineInfo[i].times].x, lineInfo[i].pointsMod[lineInfo[i].times].y, lineInfo[i].pointsMod[lineInfo[i].times].z)
                        lineInfo[i].positions.push(lineInfo[i].pointsMod[lineInfo[i].times + 1].x, lineInfo[i].pointsMod[lineInfo[i].times + 1].y, lineInfo[i].pointsMod[lineInfo[i].times + 1].z)
                        lineInfo[i].positions.push(lineInfo[i].pointsMod[lineInfo[i].times + 2].x, lineInfo[i].pointsMod[lineInfo[i].times + 2].y, lineInfo[i].pointsMod[lineInfo[i].times + 2].z)
                        // 衰减效果
                        for (let j = 1; j < lineInfo[i].times; j++) {
                            lineInfo[i].colors[j * 4 - 1] -= 0.02
                        }
                        // 提高性能
                        for (let ip = 0; ip < lineInfo[i].positions.length / 3; ip++) {
                            if (lineInfo[i].colors[ip * 4 + 3] > 0) {
                                positions[positions.length] = lineInfo[i].positions[ip * 3]
                                positions[positions.length] = lineInfo[i].positions[ip * 3 + 1]
                                positions[positions.length] = lineInfo[i].positions[ip * 3 + 2]
    
                                colors[colors.length] = lineInfo[i].colors[ip * 4]
                                colors[colors.length] = lineInfo[i].colors[ip * 4 + 1]
                                colors[colors.length] = lineInfo[i].colors[ip * 4 + 2]
                                colors[colors.length] = lineInfo[i].colors[ip * 4 + 3]
                            }
                        }
                        if (lineInfo[i].times > lineInfo[i].maxTimes - 10) {
                            lineInfo[i].times = 0
                            lineInfo[i].colors = []
                            lineInfo[i].positions = []
                        }
                    }
                    if (buffers) {
                        iaWorld.gl.deleteBuffer(buffers.position)
                        iaWorld.gl.deleteBuffer(buffers.color)
                        buffers.position = null
                        buffers.color = null
                    }
                    buffers = iaWorld.buffer.positionBuffer.initBuffer(positions, colors);
                    iaWorld.helloIaWorld(buffers, false);
                    iaWorld.drawPoints(2)
    
                    positions = []
                    colors = []
                }
                scene.add(object);
            })
            $(".threeDiv").children().css({"width":"100%","height":"100%"});
    
            renderer.domElement.addEventListener('pointermove', onPointerMove, false);
        }
    
        ////// 场景布置相关
        /**
         * 闪烁高亮轮廓线
         * @param selectedObjects
         */
        function outlineObj(selectedObjects){
            outlinePass.pulsePeriod = 2; //数值越大，律动越慢
            outlinePass.visibleEdgeColor.set(0xff0000); // 高光颜色
            outlinePass.hiddenEdgeColor.set(0x000000);// 阴影颜色
            outlinePass.usePatternTexture = false; // 使用纹理覆盖？
            outlinePass.edgeStrength = 5; // 高光边缘强度
            outlinePass.edgeGlow = 2; // 边缘微光强度
            outlinePass.edgeThickness = 3; // 高光厚度
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
                new THREE.PointsMaterial( { color: '#A1FFF2', size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: '#ff785d', size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: '#FFFF00', size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x3a3a3a, size: 3, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: '#dcbe13', size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: '#7BDC3A', size: 1, sizeAttenuation: false } )
            ];
            for ( let i = 10; i < 300; i ++ ) {
                const stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
                stars.rotation.x = Math.random() * 6;
                stars.rotation.y = Math.random() * 6;
                stars.rotation.z = Math.random() * 6;
                stars.scale.setScalar( i * 50 );
                stars.matrixAutoUpdate = false;
                stars.updateMatrix();
                scene.add(stars);
            }
        }
        /**
         * 场景灯光
         */
        function light() {
            var point = new THREE.PointLight(0x444444);
            point.position.set(1000, 1000, 1000);
            point.lookAt(0,0,0);
            scene.add(point);
            var point2 = new THREE.PointLight(0x444444);
            point2.position.set(-1000, -1000, -1000);
            point2.lookAt(0,0,0);
            scene.add(point2);
            var point3 = new THREE.PointLight(0x444444);
            point3.position.set(-1000, 1000, -1000);
            point3.lookAt(0,0,0);
            scene.add(point3);
            var point4 = new THREE.PointLight(0x444444);
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
                antialias: true,//抗锯齿
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
         * 流光画布
         * @returns {HTMLCanvasElement}
         */
        function flowingLightCanvas() {
            canvas = document.createElement('canvas');
            canvas.id = 'glcanvas';
            canvas.width = width;
            canvas.height = height;
            // canvas.width = window.innerWidth;
            // canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0px';
            canvas.style.left = '0px';
            canvas.style.pointerEvents = 'none';
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
            controls.autoRotateSpeed = 0.5;
            controls.maxDistance = 80000;
            controls.minDistance = 0;
            controls.maxPolarAngle = Math.PI * 0.4;//控制视角俯仰角度
            return controls;
        }
    
        ////// 循环视角相关
        /**
         * 主函数 -- 2（循环动画）
         */
        export function animate() {
            controls.autoRotate = true;
            if(!flag) {controls.autoRotate = false}
            // eslint-disable-next-line no-undef
            TWEEN.update();
            raycaster.setFromCamera(mouse, camera);
            const delta = clock.getDelta();
            controls.update(delta);
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
            // eslint-disable-next-line no-undef
            new TWEEN.Tween(positionA).to(positionB, 1800).onUpdate(function (pos){
                controls.enabled = false;
            }).onComplete(function() {
                controls.enabled = true;
                if(vector3){
                    camera.lookAt(vector3);
                }
            // eslint-disable-next-line no-undef
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
         * 鼠标移动--射线提取
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
                var selectedObject = intersects[0].object;
                addSelectedObject(selectedObject);
                outlinePass.selectedObjects = selectedObjects;
                outlineObj(selectedObjects);
            } else {
                // outlinePass.selectedObjects = [];
            }
        }
        function addSelectedObject(object) {
            selectedObjects = [];
            selectedObjects.push(object);
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
            checkIntersectionClick();
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
                                    // eslint-disable-next-line no-cond-assign
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
                // eslint-disable-next-line no-empty
                } else  {}
            }
    
        }
    