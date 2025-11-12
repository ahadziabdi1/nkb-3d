"use client";

import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

type ModelProps = {
    path: string;
};

export default function Model({ path }: ModelProps) {
    const { scene } = useGLTF(path);

    const modelClone = useMemo(() => scene.clone(true), [scene]);

    const collider = useMemo(() => {
        const box = new THREE.Box3().setFromObject(modelClone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        mesh.position.copy(center);
        mesh.name = "collider";
        return mesh;
    }, [modelClone]);

    return (
        <group>
            <Clone object={modelClone} />
            <primitive object={collider} />
        </group>
    );
}