import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OneEuroFilter } from './OneEuroFilter.js';

export class Renderer {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.glassesGroup = null;
        this.modelGroup = null;
        this.headOccluder = null;
        
        this.modelWidth = 1;
        this.isDestroyed = false;
        
        // Smoothing filters
        this.filters = {
            posX: new OneEuroFilter(1.5, 0.007, 1.0),
            posY: new OneEuroFilter(1.5, 0.007, 1.0),
            posZ: new OneEuroFilter(1.5, 0.007, 1.0),
            scale: new OneEuroFilter(0.5, 0.001, 1.0),
        };

        this.ipdSamples = [];
        
        // Pre-allocated vectors for performance
        this._vLeftEye = new THREE.Vector3();
        this._vRightEye = new THREE.Vector3();
        this._vTopHead = new THREE.Vector3();
        this._vChin = new THREE.Vector3();
        this._vTempleLeft = new THREE.Vector3();
        this._vTempleRight = new THREE.Vector3();
        this._xAxis = new THREE.Vector3();
        this._yAxis = new THREE.Vector3();
        this._zAxis = new THREE.Vector3();
        this._rotationMatrix = new THREE.Matrix4();
        this._faceQuaternion = new THREE.Quaternion();
        this._flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    }

    init(container) {
        this.isDestroyed = false;
        const w = container.clientWidth;
        const h = container.clientHeight;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
        });
        const dpr = Math.min(Math.max(window.devicePixelRatio, 1), 2.0);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.sortObjects = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        container.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();

        // Environment Map
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
        pmremGenerator.dispose();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        this.camera.position.set(0, 0, 5);

        // Lights
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(-5, 5, 5);
        this.scene.add(directionalLight);

        // Head occluder
        const occMat = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            side: THREE.DoubleSide,
        });
        this.headOccluder = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), occMat);
        this.headOccluder.renderOrder = 1;
        this.scene.add(this.headOccluder);

        // Groups
        this.glassesGroup = new THREE.Group();
        this.glassesGroup.renderOrder = 2;
        this.glassesGroup.visible = false;
        this.modelGroup = new THREE.Group();
        this.modelGroup.renderOrder = 4;
        this.glassesGroup.add(this.modelGroup);
        this.scene.add(this.glassesGroup);

        // Resize
        this._resizeObserver = new ResizeObserver(() => this.resize(container));
        this._resizeObserver.observe(container);
    }

    resize(container) {
        if (!this.renderer || !this.camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    async loadModel(url, config = {}) {
        if (!url) {
            console.warn('[Renderer] loadModel called with empty URL — skipping.');
            return;
        }
        console.log('[Renderer] Loading GLTF model from:', url);
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => {
                    console.log('[Renderer] GLTF load successful. Processing scene...');
                    const glassesScene = gltf.scene;
                    // Center model and fix scale/rotation
                    const bbox = new THREE.Box3().setFromObject(glassesScene);
                    const center = new THREE.Vector3();
                    bbox.getCenter(center);
                    const size = new THREE.Vector3();
                    bbox.getSize(size);
                    
                    console.log('[Renderer] Model size:', size.x, size.y, size.z);
                    glassesScene.position.sub(center); // Move center of model to origin
                    this.modelWidth = Math.max(size.x, 0.001);

                    glassesScene.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.depthWrite = !child.material.transparent;
                            if (!child.material.transparent) {
                                child.material.side = THREE.DoubleSide;
                            }
                            child.material.envMapIntensity = 1.2;
                            child.material.needsUpdate = true;
                            child.renderOrder = 2;
                        }
                    });

                    // Clear previous models
                    this.modelGroup.clear();
                    this.modelGroup.add(glassesScene);

                    // Initial rotation
                    this.modelGroup.rotation.set(
                        (config.rotationX || 0) * Math.PI / 180,
                        (config.rotationY || 0) * Math.PI / 180,
                        (config.rotationZ || 0) * Math.PI / 180
                    );

                    console.log('[Renderer] GLTF model integration complete.');
                    resolve();
                },
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        console.log(`[Renderer] Model loading: ${Math.round(percentComplete)}%`);
                    }
                },
                (err) => {
                    console.error('[Renderer] GLTFLoader failed to load model:', url, err);
                    reject(err);
                }
            );
        });
    }


    render(faceData, video, config) {
        if (this.isDestroyed || !this.renderer || !this.scene || !this.camera) return;

        if (!faceData || !video) {
            if (this.glassesGroup.visible) {
                console.log('[Renderer] Face tracking lost.');
                this.glassesGroup.visible = false;
            }
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // One-time log to confirm faceData is arriving
        if (!this._faceDetectedLogged) {
            console.log('[Renderer] ✅ faceData received! Landmarks:', faceData.length);
            this._faceDetectedLogged = true;
        }

        this.glassesGroup.visible = true;

        const now = performance.now() / 1000;
        const distance = this.camera.position.z;
        const vFov = this.camera.fov * Math.PI / 180;
        const viewportHeight = 2 * Math.tan(vFov / 2) * distance;
        const viewportWidth = viewportHeight * this.camera.aspect;

        const videoAspect = video.videoWidth / video.videoHeight || 1;
        const vpAspect = viewportWidth / viewportHeight;

        let scaleX = viewportWidth;
        let scaleY = viewportHeight;

        if (vpAspect > videoAspect) {
            scaleY = viewportWidth / videoAspect;
        } else {
            scaleX = viewportHeight * videoAspect;
        }

        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];
        const topOfHead = faceData[10];
        const bottomOfChin = faceData[152];
        const templeLeft = faceData[454];
        const templeRight = faceData[234];

        const rawX = (0.5 - noseBridge.x) * scaleX;
        const rawY = (0.5 - noseBridge.y) * scaleY;
        const rawZ = -noseBridge.z * scaleX;

        const x = this.filters.posX.filter(rawX, now);
        const y = this.filters.posY.filter(rawY, now);
        const z = this.filters.posZ.filter(rawZ, now);

        const toViewSpace = (p, vec) => vec.set((0.5 - p.x) * scaleX, (0.5 - p.y) * scaleY, -p.z * scaleX);

        toViewSpace(leftEye, this._vLeftEye);
        toViewSpace(rightEye, this._vRightEye);
        toViewSpace(topOfHead, this._vTopHead);
        toViewSpace(bottomOfChin, this._vChin);
        toViewSpace(templeLeft, this._vTempleLeft);
        toViewSpace(templeRight, this._vTempleRight);

        this._xAxis.subVectors(this._vRightEye, this._vLeftEye).normalize();
        this._yAxis.subVectors(this._vTopHead, this._vChin).normalize();
        this._zAxis.crossVectors(this._xAxis, this._yAxis).normalize();
        this._yAxis.crossVectors(this._zAxis, this._xAxis).normalize();

        if (this._yAxis.y < -0.5) {
            this._yAxis.y = -0.5;
            this._yAxis.normalize();
            this._zAxis.crossVectors(this._xAxis, this._yAxis).normalize();
            this._xAxis.crossVectors(this._yAxis, this._zAxis).normalize();
        }

        this._rotationMatrix.makeBasis(this._xAxis, this._yAxis, this._zAxis);
        this._faceQuaternion.setFromRotationMatrix(this._rotationMatrix);
        this._faceQuaternion.multiply(this._flipY);

        const rawIPD = this._vRightEye.distanceTo(this._vLeftEye);
        
        if (this.ipdSamples.length < 60) {
            this.ipdSamples.push(rawIPD);
        }

        const baseDistance = this.filters.scale.filter(rawIPD, now);
        const scaleFactor = config.scaleFactor || 2.5;
        
        const depthCorrection = 1 + noseBridge.z * 0.5;
        const normalizedScale = baseDistance / this.modelWidth;
        const adjustedScale = Math.min(Math.max(normalizedScale * scaleFactor * depthCorrection, 0.001), 5.0);

        const dynamicOffsetZ = (config.offsetZ || 0) - noseBridge.z * 0.2;

        this.glassesGroup.position.set(x, y, z);
        this.glassesGroup.scale.set(adjustedScale, adjustedScale, adjustedScale);
        this.glassesGroup.quaternion.copy(this._faceQuaternion);

        this.modelGroup.position.set(config.offsetX || 0, config.offsetY || 0, dynamicOffsetZ);

        // Update head occluder
        const headScale = adjustedScale * this.modelWidth * 1.5;
        this.headOccluder.scale.set(headScale, headScale * 1.3, headScale);
        this.headOccluder.position.copy(this.glassesGroup.position);
        this.headOccluder.quaternion.copy(this._faceQuaternion);
        this.headOccluder.translateZ(-headScale * 0.4);
        this.headOccluder.translateY(-headScale * 0.1);

        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        this.isDestroyed = true;
        console.log('[Renderer] stop() triggered. Cleaning up Three.js resources...');
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        
        // Traverse scene and dispose everything
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            this.scene.environment?.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            const dom = this.renderer.domElement;
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
            this.renderer = null;
        }
        console.log('[Renderer] stop() complete.');
    }
}
