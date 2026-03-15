"use client";

import { useRef, useEffect, useMemo, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Glasses } from "@/types/glasses";
import * as THREE from "three";

// ─── Filtro One Euro ────────────────────────────────────────────────────────
// Filtro de paso bajo adaptativo estándar de la industria para reducir el ruido 
// de seguimiento en AR.
// A baja velocidad (ruido de rotación): suaviza agresivamente → sin vibración.
// A alta velocidad (usuario moviéndose): sigue rápido → sin retraso.
// Referencia: http://cristal.univ-lille.fr/~casiez/1euro/
// ─────────────────────────────────────────────────────────────────────────────
class OneEuroFilter {
    private firstTime = true;
    private xPrev = 0;
    private dxPrev = 0;
    private tPrev = 0;

    constructor(
        private minCutoff = 1.0,  // Lower = stronger smoothing for slow changes
        private beta = 0.0,       // Higher = more responsive to fast changes
        private dCutoff = 1.0     // Derivative cutoff (usually 1.0)
    ) { }

    private alpha(cutoff: number, dt: number): number {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / dt);
    }

    filter(x: number, timestamp: number): number {
        if (this.firstTime) {
            this.firstTime = false;
            this.xPrev = x;
            this.dxPrev = 0;
            this.tPrev = timestamp;
            return x;
        }

        const dt = timestamp - this.tPrev;
        if (dt <= 0) return this.xPrev;

        // Smoothed derivative
        const dx = (x - this.xPrev) / dt;
        const edAlpha = this.alpha(this.dCutoff, dt);
        const dxHat = edAlpha * dx + (1 - edAlpha) * this.dxPrev;

    // Calibración adaptativa: movimiento lento → corte bajo (más suavizado)
        const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
        const a = this.alpha(cutoff, dt);
        const xHat = a * x + (1 - a) * this.xPrev;

        this.xPrev = xHat;
        this.dxPrev = dxHat;
        this.tPrev = timestamp;

        return xHat;
    }

    reset() { this.firstTime = true; }
}

interface GlassesRendererProps {
    productRef: MutableRefObject<Glasses>;
    faceDataRef: MutableRefObject<any>;
    video: HTMLVideoElement | null;
    debugRef?: MutableRefObject<Record<string, string | number> | null>;
}

// Pre-allocated vectors to avoid GC pressure inside useFrame
const _vLeftEye = new THREE.Vector3();
const _vRightEye = new THREE.Vector3();
const _vTopHead = new THREE.Vector3();
const _vChin = new THREE.Vector3();
const _vTempleLeft = new THREE.Vector3();
const _vTempleRight = new THREE.Vector3();
const _xAxis = new THREE.Vector3();
const _yAxis = new THREE.Vector3();
const _zAxis = new THREE.Vector3();
const _rotationMatrix = new THREE.Matrix4();
const _faceQuaternion = new THREE.Quaternion();
const _flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

export default function GlassesRenderer({ productRef, faceDataRef, video, debugRef }: GlassesRendererProps) {
    const groupRef = useRef<THREE.Group>(null);
    const noseRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const templeLeftRef = useRef<THREE.Mesh>(null);
    const templeRightRef = useRef<THREE.Mesh>(null);
    const headOccluderRef = useRef<THREE.Mesh>(null);
    const modelGroupRef = useRef<THREE.Group>(null);

    // Ancho nativo del modelo GLTF — calculado desde el bounding box al cargar
    const modelWidthRef = useRef<number>(1);

    // Muestras de IPD: promedio de los primeros 60 frames (~1s) para referencia estable.
    const ipdSamplesRef = useRef<number[]>([]);
    const lockedIPDRef = useRef<number>(0);

    /** Invisible depth-only material that hides geometry behind the head silhouette. */
    const headOccluderMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            side: THREE.FrontSide,
        });
    }, []);

    let modelUrl = productRef.current.model_3d_file || "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/glasses/model.gltf";

    if (modelUrl.includes(':8000/media/')) {
        modelUrl = modelUrl.replace(/http:\/\/[^/]+:8000\/media\//, '/django-media/');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { scene } = useGLTF(modelUrl) as any;

    useEffect(() => {
        if (scene) {
            // Calcular el ancho nativo del modelo desde el bounding box
            const bbox = new THREE.Box3().setFromObject(scene);
            const size = new THREE.Vector3();
            bbox.getSize(size);
            modelWidthRef.current = Math.max(size.x, 0.001); // Evitar división por cero

            scene.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                    child.material.side = THREE.DoubleSide;
                    child.material.depthWrite = true;
                    child.renderOrder = 2;
                }
            });
        }
    }, [scene]);

    useFrame((state) => {
        const { viewport } = state;
        const faceData = faceDataRef.current;
        if (!groupRef.current || !faceData || !video) return;

        // MediaPipe landmark indices — use RAW values for instant tracking (zero lag)
        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];
        const topOfHead = faceData[10];
        const bottomOfChin = faceData[152];
        const templeLeft = faceData[454];
        const templeRight = faceData[234];

        const now = performance.now() / 1000; // seconds (for IPD filter only)

        // Video-to-viewport aspect ratio correction
        const videoAspect = video.videoWidth / video.videoHeight || 1;
        const viewportAspect = viewport.width / viewport.height;

        let scaleX = viewport.width;
        let scaleY = viewport.height;

        if (viewportAspect > videoAspect) {
            scaleY = viewport.width / videoAspect;
        } else {
            scaleX = viewport.height * videoAspect;
        }

        // Position: Map normalized MediaPipe coords to 3D viewport space
        const x = (0.5 - noseBridge.x) * scaleX;
        const y = (0.5 - noseBridge.y) * scaleY;
        const z = -noseBridge.z * scaleX;

        // Rotación: Construir base ortonormal a partir de landmarks faciales
        const toViewSpace = (p: { x: number; y: number; z: number }, vec: THREE.Vector3) => vec.set(
            (0.5 - p.x) * scaleX,
            (0.5 - p.y) * scaleY,
            -p.z * scaleX
        );

        toViewSpace(leftEye, _vLeftEye);
        toViewSpace(rightEye, _vRightEye);
        toViewSpace(topOfHead, _vTopHead);
        toViewSpace(bottomOfChin, _vChin);
        toViewSpace(templeLeft, _vTempleLeft);
        toViewSpace(templeRight, _vTempleRight);

        _xAxis.subVectors(_vRightEye, _vLeftEye).normalize();
        _yAxis.subVectors(_vTopHead, _vChin).normalize();
        _zAxis.crossVectors(_xAxis, _yAxis).normalize();
        _yAxis.crossVectors(_zAxis, _xAxis).normalize(); // Corrección ortogonal

        // Clamp de Pitch — evita que el cuaternión se invierta cuando la cabeza se inclina demasiado
        if (_yAxis.y < -0.5) {
            _yAxis.y = -0.5;
            _yAxis.normalize();
            _zAxis.crossVectors(_xAxis, _yAxis).normalize();
            _xAxis.crossVectors(_yAxis, _zAxis).normalize();
        }

        _rotationMatrix.makeBasis(_xAxis, _yAxis, _zAxis);
        _faceQuaternion.setFromRotationMatrix(_rotationMatrix);
        _faceQuaternion.multiply(_flipY); // Voltear 180° en Y para video en espejo

        // IPD en tiempo real — escala instantánea, sin retraso de filtrado
        const rawIPD = Math.abs(_vRightEye.x - _vLeftEye.x);

        // Mantener bloqueo como referencia solo para diagnósticos de HUD
        if (ipdSamplesRef.current.length < 60) {
            ipdSamplesRef.current.push(rawIPD);
            lockedIPDRef.current = ipdSamplesRef.current.reduce((a, b) => a + b, 0) / ipdSamplesRef.current.length;
        }

        // USAR rawIPD en tiempo real para la escala — sin retraso
        const baseDistance = rawIPD;
        const scaleFactor = productRef.current.scale_factor || 2.5;
        const modelWidth = modelWidthRef.current;

        // Escala normalizada — IPD / modelWidth hace que los lentes coincidan con el ancho de los ojos,
        // luego scale_factor ajusta (1.0 = IPD exacto, 1.5 = 50% más ancho, etc.)
        const depthCorrection = 1 + noseBridge.z * 0.5;
        const normalizedScale = baseDistance / modelWidth;
        const adjustedScale = Math.max(normalizedScale * scaleFactor * depthCorrection, 0.001);

        // Varianza de IPD (porcentaje) — debería ser < 5% post-bloqueo
        let ipdVar = 0;
        if (ipdSamplesRef.current.length > 1) {
            const mean = lockedIPDRef.current;
            const sqDiffs = ipdSamplesRef.current.map(v => (v - mean) ** 2);
            const variance = sqDiffs.reduce((a, b) => a + b, 0) / sqDiffs.length;
            ipdVar = (Math.sqrt(variance) / mean) * 100; // CV como porcentaje
        }

        // Escribir valores de depuración para el overlay de HUD (Opcional)
        /*
        if (debugRef) {
            debugRef.current = {
                ...
            };
        }
        */

        // Offset Z dinámico basado en la profundidad de la nariz
        const dynamicOffsetZ = (productRef.current.offset_z || 0) - noseBridge.z * 0.2;

        const groupX = x;
        const groupY = y;
        const groupZ = z;

        // Aplicar transformación directamente — sin interpolación para seguimiento instantáneo
        groupRef.current.position.set(groupX, groupY, groupZ);
        groupRef.current.scale.set(adjustedScale, adjustedScale, adjustedScale);
        groupRef.current.quaternion.copy(_faceQuaternion);

        // Aplicar offset Z dinámico al subgrupo del modelo
        if (modelGroupRef.current) {
            modelGroupRef.current.position.set(
                productRef.current.offset_x || 0,
                productRef.current.offset_y || 0,
                dynamicOffsetZ
            );
        }

        // Puntos de anclaje de depuración (Comentados para producción)
        /*
        if (noseRef.current) noseRef.current.position.set(x, y, z);
        if (templeLeftRef.current) templeLeftRef.current.position.set(_vTempleLeft.x, _vTempleLeft.y, _vTempleLeft.z);
        if (templeRightRef.current) templeRightRef.current.position.set(_vTempleRight.x, _vTempleRight.y, _vTempleRight.z);
        */

        // Oclusor de cabeza: cubo dimensionado a la distancia entre ojos (rawIPD).
        // Proporciona una zona de oclusión predecible detrás del puente de la nariz.
        if (headOccluderRef.current) {
            const eyeDistance = rawIPD; 

            const headWidth = eyeDistance * 1.7;
            const headHeight = eyeDistance * 2;
            const headDepth = eyeDistance * 2;

            // Posición: centrada en la cara, desplazada detrás del plano frontal
            const occluderX = groupX;
            const occluderY = groupY;
            const occluderZ = groupZ - 0.9; // Desplazado hacia atrás para evitar lentes

            headOccluderRef.current.position.set(occluderX, occluderY, occluderZ);
            headOccluderRef.current.quaternion.copy(_faceQuaternion);
            headOccluderRef.current.scale.set(headWidth, headHeight, headDepth);
        }

    });

    return (
        <group>
            {/* Oclusor de cabeza — Caja dimensionada según IPD */}
            <mesh
                ref={headOccluderRef}
                material={headOccluderMaterial}
                renderOrder={1}
            >
                <boxGeometry args={[1, 1, 1]} />
            </mesh>

            {/* Marcadores de depuración (Comentados para producción) */}
            {/* 
            <mesh ref={noseRef}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshBasicMaterial color="blue" />
            </mesh>
            <mesh ref={templeLeftRef}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshBasicMaterial color="blue" />
            </mesh>
            <mesh ref={templeRightRef}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshBasicMaterial color="blue" />
            </mesh>
            */}

            <group ref={groupRef} renderOrder={2}>
                <group ref={modelGroupRef} renderOrder={4}>
                    <primitive
                        object={scene}
                        rotation={[0, 0, 0]}
                    />
                </group>
            </group>

        </group>
    );
}