'use client';

import Image from "next/image";
import { Glasses } from "@/types/glasses";
import { ARTryOnButton } from '@ar-project/react-wrapper';
import { getProxyMediaUrl } from "@/lib/utils";

interface ARTryOnProps {
    product: Glasses;
}

export default function ARTryOn({ product }: ARTryOnProps) {
    const apiKey   = process.env.NEXT_PUBLIC_AR_API_KEY || 'test_api_key_123';
    const modelUrl = getProxyMediaUrl(product.model_3d_file);

    if (!modelUrl) {
        console.warn('[ARTryOn] product.model_3d_file is empty — AR will start without model.');
    }

    return (
        <div className="relative h-full w-full bg-gray-50">
            {/* Product image — always visible */}
            <div className="relative h-full w-full">
                <Image
                    src={getProxyMediaUrl(product.thumbnail)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    loading="eager"
                />
            </div>

            {/* AR trigger — bottom center, absolute over image */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                <ARTryOnButton
                    apiKey={apiKey}
                    modelUrl={modelUrl}
                    productName={product.name}
                    buttonText="Pruébatelos en 3D"
                    showCameraSwitch
                    config={{
                        scaleFactor: product.scale_factor  ?? 0.15,
                        offsetX:     product.offset_x      ?? 0,
                        offsetY:     product.offset_y      ?? 0.02,
                        offsetZ:     product.offset_z      ?? 0,
                    }}
                />
            </div>
        </div>
    );
}
