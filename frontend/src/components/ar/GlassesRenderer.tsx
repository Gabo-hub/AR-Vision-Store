"use client";

import { useRef, useEffect, useMemo, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Glasses } from "@/types/glasses";
import * as THREE from "three";

interface GlassesRendererProps {
    product: Glasses;
    faceDataRef: MutableRefObject<{ x: number; y: number; z: number }[] | null>;
    debugOffsets?: { x: number, y: number, z: number, scale: number };
    video?: HTMLVideoElement | null;
}

// Pre-allocated vectors to avoid GC pressure inside useFrame
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

export default function GlassesRenderer({ product, faceDataRef, debugOffsets, video }: GlassesRendererProps) {
    const groupRef = useRef<THREE.Group>(null);
    const noseRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const headOccluderRef = useRef<THREE.Mesh>(null);

    const { viewport } = useThree();

    /** Invisible depth-only material that hides geometry behind the head silhouette. */
    const headOccluderMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            side: THREE.FrontSide,
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
                    child.renderOrder = 2;
                }
            });
        }
    }, [scene]);

    useFrame(() => {
        const faceData = faceDataRef.current;
        if (!groupRef.current || !faceData || !video) return;

        // MediaPipe landmark indices
        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];
        const topOfHead = faceData[10];
        const bottomOfChin = faceData[152];

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

        // Rotation: Build orthonormal basis from facial landmarks
        const toViewSpace = (p: { x: number; y: number; z: number }, vec: THREE.Vector3) => vec.set(
            (0.5 - p.x) * scaleX,
            (0.5 - p.y) * scaleY,
            -p.z * scaleX
        );

        toViewSpace(leftEye, _vLeftEye);
        toViewSpace(rightEye, _vRightEye);
        toViewSpace(topOfHead, _vTopHead);
        toViewSpace(bottomOfChin, _vChin);

        _xAxis.subVectors(_vRightEye, _vLeftEye).normalize();
        _yAxis.subVectors(_vTopHead, _vChin).normalize();
        _zAxis.crossVectors(_xAxis, _yAxis).normalize();
        _yAxis.crossVectors(_zAxis, _xAxis).normalize(); // Orthogonal correction

        _rotationMatrix.makeBasis(_xAxis, _yAxis, _zAxis);
        _faceQuaternion.setFromRotationMatrix(_rotationMatrix);
        _faceQuaternion.multiply(_flipY); // Flip 180° on Y for mirrored video

        // Scale: Inter-pupillary distance drives model size
        const baseDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2) +
            Math.pow(rightEye.z - leftEye.z, 2)
        );

        const finalScale = debugOffsets?.scale ?? (product.scale_factor || 2.5);
        const adjustedScale = Math.max(baseDistance * finalScale, 0.001);

        const groupX = x;
        const groupY = (y - 0.05);
        const groupZ = z;

        // Apply transform directly — no interpolation for instant tracking
        groupRef.current.position.set(groupX, groupY, groupZ);
        groupRef.current.scale.set(adjustedScale, adjustedScale, adjustedScale);
        groupRef.current.quaternion.copy(_faceQuaternion);

        // Debug anchor points
        if (noseRef.current) noseRef.current.position.set(x, y, z);
        if (leftEyeRef.current) leftEyeRef.current.position.set(_vLeftEye.x, _vLeftEye.y, _vLeftEye.z);
        if (rightEyeRef.current) rightEyeRef.current.position.set(_vRightEye.x, _vRightEye.y, _vRightEye.z);

        // Head occluder: invisible box that hides temple arms behind the face
        if (headOccluderRef.current) {
            headOccluderRef.current.position.set(groupX, groupY + 0.05, groupZ);
            headOccluderRef.current.quaternion.copy(_faceQuaternion);

            const headScaleRatio = baseDistance * scaleX;
            const headWidth = headScaleRatio * 3;
            const headHeight = headScaleRatio * 3;
            const headDepth = headScaleRatio * 2;

            headOccluderRef.current.scale.set(headWidth / 2, headHeight / 2, headDepth / 2);
            headOccluderRef.current.translateZ(-headDepth * 0.3);
            headOccluderRef.current.translateY(headHeight * -0.1);
        }

    });

    return (
        <group>
            {/* Head Occluder */}
            <mesh
                ref={headOccluderRef}
                material={headOccluderMaterial}
                renderOrder={1}
            >
                <boxGeometry args={[1, 1, 1]} />
            </mesh>

            <group ref={groupRef} renderOrder={2}>
                <mesh renderOrder={3}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial color="white" depthTest={false} transparent opacity={1} />
                </mesh>

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