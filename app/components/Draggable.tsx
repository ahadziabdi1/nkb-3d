"use client";

import { useRef, useState, useEffect } from "react";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { saveModelState, loadModelState } from "../../firebase/firestore";

type Vec3 = { x: number; y: number; z: number };

type DraggableProps = {
  children: React.ReactNode;
  modelId: string;
  initialPosition?: Vec3;
  initialRotation?: Vec3;
};

export default function Draggable({
  children,
  modelId,
  initialPosition = { x: 0, y: 0, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 }
}: DraggableProps) {
  const ref = useRef<THREE.Object3D>(null);
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersection = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());
  const { camera, raycaster, mouse } = useThree();

  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await loadModelState(modelId);
      if (!ref.current) return;
      if (data?.position && data?.rotation) {
        ref.current.position.set(data.position.x, data.position.y, data.position.z);
        ref.current.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
      } else {
        ref.current.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        ref.current.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
      }
    })();
  }, [modelId, initialPosition, initialRotation]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); 
    setDragging(true);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane.current, intersection.current);
    if (ref.current) offset.current.copy(intersection.current).sub(ref.current.position);
  };

  const onPointerDownRotate = (e: ThreeEvent<PointerEvent>) => {
    if (e.button === 2 || e.shiftKey) {
      e.stopPropagation();
      setRotating(true);
    }
  };

  const onPointerUp = () => {
    setDragging(false);
    setRotating(false);
    if (!ref.current) return;
    saveModelState(
      modelId,
      { x: ref.current.position.x, y: ref.current.position.y, z: ref.current.position.z },
      { x: ref.current.rotation.x, y: ref.current.rotation.y, z: ref.current.rotation.z }
    );
  };

  useFrame(() => {
    if (dragging && ref.current) {
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
        ref.current.position.x = intersection.current.x - offset.current.x * -1;
        ref.current.position.z = intersection.current.z - offset.current.z * -1;
      }
    }
    if (rotating && ref.current) {
      ref.current.rotation.y += mouse.x * 0.1;
    }
  });

  return (
    <group
      ref={ref}
      onPointerDown={(e) => {
        onPointerDown(e);
        onPointerDownRotate(e);
      }}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {children}
    </group>
  );
}