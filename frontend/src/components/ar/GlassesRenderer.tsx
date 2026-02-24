'use client';

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Glasses } from "@/types/glasses";
import * as THREE from "three";

interface GlassesRendererProps {
    product: Glasses;
    faceData: any[]; // Landmarks de MediaPipe
    debugOffsets?: { x: number, y: number, z: number, scale: number };
}

export default function GlassesRenderer({ product, faceData, debugOffsets }: GlassesRendererProps) {
    const groupRef = useRef<THREE.Group>(null);

    let modelUrl = product.model_3d_file || "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/glasses/model.gltf";

    if (modelUrl.includes(':8000/media/')) {
        modelUrl = modelUrl.replace(/http:\/\/[^/]+:8000\/media\//, '/django-media/');
    }

    const { scene } = useGLTF(modelUrl);

    useFrame(() => {
        if (!groupRef.current || !faceData) return;

        // MediaPipe Landmarks Clave:
        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];

        // Posición
        const x = (noseBridge.x - 0.5) * -10;
        const y = (noseBridge.y - 0.5) * -10;
        const z = noseBridge.z * -10;

        const finalOffsetX = debugOffsets?.x ?? (product.offset_x || 0);
        const finalOffsetY = debugOffsets?.y ?? (product.offset_y || 0);
        const finalOffsetZ = debugOffsets?.z ?? (product.offset_z || 0);
        const finalScale = debugOffsets?.scale ?? (product.scale_factor || 10);

        groupRef.current.position.set(
            x + finalOffsetX,
            y + finalOffsetY,
            z + finalOffsetZ
        );

        // Rotación
        const dx = rightEye.x - leftEye.x;
        const dy = rightEye.y - leftEye.y;
        const roll = Math.atan2(dy, dx);

        groupRef.current.rotation.set(0, 0, roll);

        // Escala
        const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        const s = distance * finalScale * 8;
        groupRef.current.scale.set(s, s, s);
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} />
        </group>
    );
}
