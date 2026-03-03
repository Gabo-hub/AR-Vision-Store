"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Glasses } from "@/types/glasses";
import * as THREE from "three";

interface GlassesRendererProps {
    product: Glasses;
    faceData: { x: number; y: number; z: number }[]; // Landmarks de MediaPipe
    debugOffsets?: { x: number, y: number, z: number, scale: number };
    video?: HTMLVideoElement | null;
}

const _vLeftEye = new THREE.Vector3();
const _vRightEye = new THREE.Vector3();
const _vTopHead = new THREE.Vector3();
const _vChin = new THREE.Vector3();
const _xAxis = new THREE.Vector3();
const _yAxis = new THREE.Vector3();
const _zAxis = new THREE.Vector3();
const _rotationMatrix = new THREE.Matrix4();
const _faceQuaternion = new THREE.Quaternion();
const _flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

export default function GlassesRenderer({ product, faceData, debugOffsets, video }: GlassesRendererProps) {
    const groupRef = useRef<THREE.Group>(null);
    const noseRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const headOccluderRef = useRef<THREE.Mesh>(null);

    const { viewport } = useThree();

    // Material: occluder invisible. Escribe en el depth buffer (para ocultar lo que esté detrás)
    const headOccluderMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: 0xff0000,   // Color rojo para que resalte
            wireframe: false,   // Verlo como malla hueca
            colorWrite: false,  // <-- LO PRENDEMOS DE NUEVO PARA VERLO
            depthWrite: true,
            side: THREE.FrontSide,
            transparent: false, // Lo hacemos transparente para debuggear
            opacity: 0.3,
        });
    }, []);

    let modelUrl = product.model_3d_file || "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/glasses/model.gltf";

    if (modelUrl.includes(':8000/media/')) {
        modelUrl = modelUrl.replace(/http:\/\/[^/]+:8000\/media\//, '/django-media/');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { scene } = useGLTF(modelUrl) as any;

    useEffect(() => {
        if (scene) {
            scene.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                    child.material.side = THREE.DoubleSide;
                    child.material.depthWrite = true;
                    // Forcer render order 2 for occlusion order to work reliably
                    child.renderOrder = 2;
                }
            });
        }
    }, [scene]);


    useFrame(() => {
        if (!groupRef.current || !faceData || !video) return;

        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];
        const topOfHead = faceData[10];
        const bottomOfChin = faceData[152];

        // 1. ESCALA DE VIDEO vs VIEWPORT
        const videoAspect = video.videoWidth / video.videoHeight || 1;
        const viewportAspect = viewport.width / viewport.height;

        let scaleX = viewport.width;
        let scaleY = viewport.height;

        if (viewportAspect > videoAspect) {
            scaleY = viewport.width / videoAspect;
        } else {
            scaleX = viewport.height * videoAspect;
        }

        // 2. POSICIÓN
        const x = (0.5 - noseBridge.x) * scaleX;
        const y = (0.5 - noseBridge.y) * scaleY;
        const z = -noseBridge.z * scaleX;

        // 3. ROTACIÓN - Asignar directamente a las variables pre-localizadas sin crear 'new' objs
        const toViewSpace = (p: { x: number; y: number; z: number }, vec: THREE.Vector3) => vec.set(
            (0.5 - p.x) * scaleX,
            (0.5 - p.y) * scaleY,
            -p.z * scaleX
        );

        toViewSpace(leftEye, _vLeftEye);
        toViewSpace(rightEye, _vRightEye);
        toViewSpace(topOfHead, _vTopHead);
        toViewSpace(bottomOfChin, _vChin);

        // xAxis apunta de izquierda a derecha en la pantalla (espacio ViewSpace +X)
        _xAxis.subVectors(_vRightEye, _vLeftEye).normalize();
        // yAxis apunta hacia arriba desde la barbilla a la cabeza (+Y)
        _yAxis.subVectors(_vTopHead, _vChin).normalize();

        // Producto Cruz: X (+) x Y (+) = Z (+)
        _zAxis.crossVectors(_xAxis, _yAxis).normalize();

        // Corrección ortogonal para asegurarnos de que la matriz no se deforma. 
        _yAxis.crossVectors(_zAxis, _xAxis).normalize();

        _rotationMatrix.makeBasis(_xAxis, _yAxis, _zAxis);
        _faceQuaternion.setFromRotationMatrix(_rotationMatrix);

        // Giramos 180 grados el modelo a la fuerza en el eje Y (giro de cuello)
        _faceQuaternion.multiply(_flipY);

        // 4. ESCALA DINÁMICA
        const baseDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2) +
            Math.pow(rightEye.z - leftEye.z, 2)
        );

        const finalOffsetX = debugOffsets?.x ?? (product.offset_x || 0);
        const finalOffsetY = debugOffsets?.y ?? (product.offset_y || 0);
        const finalOffsetZ = debugOffsets?.z ?? (product.offset_z || 0);

        // Ajustamos la escala base multiplicándola
        const finalScale = debugOffsets?.scale ?? (product.scale_factor || 2.5);
        const adjustedScale = Math.max(baseDistance * finalScale, 0.001);

        const groupX = x;
        const groupY = (y - 0.05);
        const groupZ = z;

        groupRef.current.position.set(groupX, groupY, groupZ);
        groupRef.current.scale.set(adjustedScale, adjustedScale, adjustedScale);
        groupRef.current.quaternion.copy(_faceQuaternion);

        // Puntos de anclaje
        if (noseRef.current) noseRef.current.position.set(x, y, z);
        if (leftEyeRef.current) leftEyeRef.current.position.set(_vLeftEye.x, _vLeftEye.y, _vLeftEye.z);
        if (rightEyeRef.current) rightEyeRef.current.position.set(_vRightEye.x, _vRightEye.y, _vRightEye.z);

        // 5. CABEZA INVISIBLE (HEAD OCCLUDER)
        if (headOccluderRef.current) {
            // Ponemos el centro del occluder exactamente en la nariz
            headOccluderRef.current.position.set(x, y, z);
            headOccluderRef.current.quaternion.copy(_faceQuaternion);

            // Ajustamos las proporciones promedio de un cráneo humano respecto a los ojos
            // Volvemos a baseDistance escalado a viewSpace multiplicándolo por scaleX
            const headScaleRatio = baseDistance * scaleX;
            const headWidth = headScaleRatio * 3;
            const headHeight = headScaleRatio * 3;
            const headDepth = headScaleRatio * 2;

            // SphereGeometry tiene radio base de 1 (diámetro 2).
            headOccluderRef.current.scale.set(headWidth / 2, headHeight / 2, headDepth / 2);

            // En el espacio local de la cabeza, empujamos el centro de la esfera hacia atrás
            // para que no atraviese la cara frontal (donde van las gafas), sino que ocupe el cráneo posterior/lateral.
            // Incrementar esto empuja la esfera de ocultamiento más profundo lejos del frente de los lentes.
            headOccluderRef.current.translateZ(-headDepth * 0.3);
            // Bajamos un poquito la esfera porque los ojos están en la mitad superior de la cabeza
            headOccluderRef.current.translateY(headHeight * -0.1);
        }

    });

    return (
        <group>
            {/* CABEZA OCLUSORA (Head Occluder) */}
            <mesh
                ref={headOccluderRef}
                material={headOccluderMaterial}
                renderOrder={1}
            >
                {/* Ahora usamos una caja (cubo) para el oclusor de la cabeza */}
                <boxGeometry args={[1, 1, 1]} />
            </mesh>

            <group ref={groupRef} renderOrder={2}>
                {/* Centro del modelo */}
                <mesh renderOrder={3}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial color="white" depthTest={false} transparent opacity={1} />
                </mesh>

                {/* Lentes (renderOrder=2, se pintan después del face mesh) */}
                <group renderOrder={4}>
                    <primitive
                        object={scene}
                        rotation={[0, 0, 0]}
                        position={[0, 0, 0]}
                    />
                </group>
            </group>

        </group>
    );
}