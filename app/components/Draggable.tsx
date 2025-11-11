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
    registerModel: (ref: THREE.Object3D | null) => void;
    otherModels: Record<string, THREE.Object3D | null>;
};

export default function Draggable({
    children,
    modelId,
    initialPosition = { x: 0, y: 0, z: 0 },
    initialRotation = { x: 0, y: 0, z: 0 },
    registerModel,
    otherModels,
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

    function intersects(a: THREE.Object3D, b: THREE.Object3D): boolean {
        const boxA = new THREE.Box3().setFromObject(a);
        const boxB = new THREE.Box3().setFromObject(b);
        return boxA.intersectsBox(boxB);
    }


    useFrame(() => {
        if (dragging && ref.current) {
            raycaster.setFromCamera(mouse, camera);
            if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
                const newX = intersection.current.x - offset.current.x * -1;
                const newZ = intersection.current.z - offset.current.z * -1;

                const oldX = ref.current.position.x;
                const oldZ = ref.current.position.z;

                ref.current.position.x = newX;
                ref.current.position.z = newZ;

                let blocked = false;

                for (const key in otherModels) {
                    const other = otherModels[key];
                    if (other && other !== ref.current) {
                        if (intersects(ref.current, other)) {
                            blocked = true;
                            break;
                        }
                    }
                }

                if (blocked) {
                    ref.current.position.x = oldX;
                    ref.current.position.z = oldZ;
                }

            }
        }
        if (rotating && ref.current) {
            ref.current.rotation.y += mouse.x * 0.1;
        }
    });

    return (
        <group
            ref={(r) => {
                ref.current = r;
                registerModel(r);   // ✅ samo ovo prijavljuje model Scene komponenti
            }}
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