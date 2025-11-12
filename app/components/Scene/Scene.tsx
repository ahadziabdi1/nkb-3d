"use client";

import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React, { createContext, useRef, useState, useEffect } from "react";
import Draggable from "../Draggable";
import Model from "../Model";
import { saveModelState } from "@/firebase/firestore";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import styles from "./Scene.module.css";

export const ModelsContext = createContext<{
    models: React.MutableRefObject<Record<string, THREE.Object3D | null>>;
}>({
    models: { current: {} },
});

function TopViewController({ topView }: { topView: boolean }) {
    const { camera } = useThree();

    useEffect(() => {
        if (topView) {
            camera.position.set(0, 10, 0);
            camera.up.set(0, 0, 1);
            camera.lookAt(0, 0, 0);
        } else {
            camera.up.set(0, 1, 0);
            camera.position.set(3, 3, 3);
            camera.lookAt(0, 0, 0);
        }
    }, [topView, camera]);

    useFrame(() => {
        if (topView) camera.lookAt(0, 0, 0);
    });

    return null;
}

export default function Scene() {
    const [topView, setTopView] = useState(false);

    const modelsRef = useRef<Record<string, THREE.Object3D | null>>({
        duck: null,
        duck2: null,
    });

    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

    const [uiRot, setUiRot] = useState<Record<string, number>>({
        duck: 0,
        duck2: 0,
    });

    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const syncUiRotation = (id: string, radY: number) => {
        setUiRot((s) => ({ ...s, [id]: Math.round(toDeg(radY)) }));
    };

    const setRotationYDeg = (id: string, deg: number) => {
        const m = modelsRef.current[id];
        if (!m) return;

        const normalized = ((deg % 360) + 360) % 360;
        m.rotation.y = toRad(normalized);

        setUiRot((s) => ({ ...s, [id]: normalized }));

        saveModelState(
            id,
            { x: m.position.x, y: m.position.y, z: m.position.z },
            { x: m.rotation.x, y: m.rotation.y, z: m.rotation.z }
        );
    };

    return (
        <ModelsContext.Provider value={{ models: modelsRef }}>
            <div className={styles.container}>
                <button
                    onClick={() => setTopView((v) => !v)}
                    className={styles.toggleBtn}
                >
                    {topView ? "Switch to 3D View" : "Switch to Top View"}
                </button>
                <div className={styles.rotationPanel}>
                    <h4>Rotation Panel</h4>
                    {["duck", "duck2"].map((id) => (
                        <div
                            key={id}
                            className={`${styles.modelCard} ${selectedModelId === id ? styles.selected : ""
                                }`}
                        >
                            <strong>{id}</strong>
                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={uiRot[id]}
                                onChange={(e) => setRotationYDeg(id, Number(e.target.value))}
                            />
                            <input
                                type="number"
                                min={0}
                                max={360}
                                value={uiRot[id]}
                                onChange={(e) => setRotationYDeg(id, Number(e.target.value))}
                            />
                        </div>
                    ))}
                </div>
                <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                    <TopViewController topView={topView} />

                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 7, 5]} intensity={0.8} />

                    <gridHelper args={[20, 20]} />

                    {/* Model 1 */}
                    <Draggable
                        modelId="duck"
                        selected={selectedModelId === "duck"}
                        onSelect={setSelectedModelId}
                        registerModel={(ref) => (modelsRef.current.duck = ref)}
                        initialPosition={{ x: -2.5, y: 0, z: 0 }}
                        onLoadRotation={(rad) => syncUiRotation("duck", rad)}
                    >
                        <Model path="/models/Duck.glb" />
                    </Draggable>

                    {/* Model 2 */}
                    <Draggable
                        modelId="duck2"
                        selected={selectedModelId === "duck2"}
                        onSelect={setSelectedModelId}
                        registerModel={(ref) => (modelsRef.current.duck2 = ref)}
                        initialPosition={{ x: 2.5, y: 0, z: 0 }}
                        onLoadRotation={(rad) => syncUiRotation("duck2", rad)}
                    >
                        <Model path="/models/Duck.glb" />
                    </Draggable>

                    <OrbitControls
                        enabled={!topView}
                        enableRotate={!topView}
                        enableZoom={!topView}
                        enablePan={!topView}
                    />

                    <EffectComposer multisampling={4}>
                        <Outline
                            visibleEdgeColor={0x00aaff}
                            hiddenEdgeColor={0x000000}
                            edgeStrength={4}
                            width={2}
                            blur
                        />
                    </EffectComposer>
                </Canvas>
            </div>
        </ModelsContext.Provider>
    );
}