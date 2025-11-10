"use client";

import { useRef, useState, useEffect } from "react";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { saveModelState, loadModelState } from "../../firebase/firestore";

type DraggableProps = {
    children: React.ReactNode;
    modelId: string;
};

export default function Draggable({ children, modelId }: DraggableProps) {

    const ref = useRef<THREE.Object3D>(null);
    const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
    const intersection = useRef(new THREE.Vector3());
    const offset = useRef(new THREE.Vector3());
    const { camera, raycaster, mouse } = useThree();

    const [dragging, setDragging] = useState(false);
    const [rotating, setRotating] = useState(false);

    // Load saved position on mount
    useEffect(() => {
        async function loadState() {
            const data = await loadModelState(modelId);

            if (data && data.position && data.rotation && ref.current) {
                ref.current.position.set(
                    data.position.x,
                    data.position.y,
                    data.position.z
                );
                ref.current.rotation.set(
                    data.rotation.x,
                    data.rotation.y,
                    data.rotation.z
                );
            }
        }
        loadState();
    }, [modelId]);

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setDragging(true);

        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane.current, intersection.current);

        offset.current.copy(intersection.current).sub(ref.current!.position);
    };

    const onPointerDownRotate = (e: ThreeEvent<PointerEvent>) => {
        // Start rotation if right-click or Shift key is pressed
        if (e.button === 2 || e.shiftKey) {
            e.stopPropagation();
            setRotating(true);
        }
    };

    const onPointerUpRotate = () => {
        setRotating(false);
    };


    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        setDragging(false);
        if (ref.current) {
            saveModelState(
                modelId,
                {
                    x: ref.current.position.x,
                    y: ref.current.position.y,
                    z: ref.current.position.z,
                },
                {
                    x: ref.current.rotation.x,
                    y: ref.current.rotation.y,
                    z: ref.current.rotation.z,
                }
            );
        }
    };

    useFrame(() => {
        if (dragging && ref.current) {
            raycaster.setFromCamera(mouse, camera);
            if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
                ref.current.position.x = intersection.current.x + offset.current.x;
                ref.current.position.z = intersection.current.z + offset.current.z;
            }
        }
        if (rotating && ref.current) {
            ref.current.rotation.y += mouse.x * 0.1;

            saveModelState(
                modelId,
                {
                    x: ref.current.position.x,
                    y: ref.current.position.y,
                    z: ref.current.position.z,
                },
                {
                    x: ref.current.rotation.x,
                    y: ref.current.rotation.y,
                    z: ref.current.rotation.z,
                }
            );
        }
    });

    return (
        <group
            ref={ref}
            onPointerDown={(e) => {
                onPointerDown(e);
                onPointerDownRotate(e);
            }}
            onPointerUp={(e) => {
                onPointerUp(e);
                onPointerUpRotate();
            }}
            onContextMenu={(e) => e.stopPropagation()} // disable right-click menu
        >
            {children}
        </group>
    );
}
