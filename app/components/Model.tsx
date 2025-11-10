"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type ModelProps = {
  path: string;
};

export default function Model({ path }: ModelProps) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;

    const modelClone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(modelClone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    collider.position.copy(center);

    ref.current.add(collider);
    ref.current.add(modelClone);
  }, [scene]);

  return <group ref={ref} />;
}
