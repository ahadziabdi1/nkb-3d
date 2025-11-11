"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React, { useEffect } from "react";
import Draggable from "./Draggable";
import Model from "./Model";

function TopViewController({ topView }: { topView: boolean }) {
    const { camera } = useThree();

    useEffect(() => {
        if (topView) {
            // pogled odozgo
            camera.position.set(0, 10, 0);
            camera.up.set(0, 0, 1);       // stabilizuje "gore" za top-down
            camera.lookAt(0, 0, 0);
        } else {
            // standard 3D
            camera.up.set(0, 1, 0);
            camera.position.set(3, 3, 3);
            camera.lookAt(0, 0, 0);
        }
    }, [topView, camera]);

    // dodatno "čuvanje" pogleda svaku sličicu dok je topView aktivan
    useFrame(() => {
        if (topView) camera.lookAt(0, 0, 0);
    });

    return null;
}

export default function Scene() {
    const [topView, setTopView] = React.useState(false);

    const [modelRefs, setModelRefs] = React.useState<{
        duck: THREE.Object3D | null;
        duck2: THREE.Object3D | null;
    }>({
        duck: null,
        duck2: null
    });


    return (
        <div style={{ width: "100%", height: "100vh", background: "#111" }}>
            <button
                onClick={() => setTopView((v) => !v)}
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    padding: "10px 20px",
                    background: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    zIndex: 10
                }}
            >
                {topView ? "Switch to 3D View" : "Switch to Top View"}
            </button>

            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                <TopViewController topView={topView} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <gridHelper args={[20, 20]} />

                {/* Model #1 */}
                <Draggable
                    modelId="duck"
                    registerModel={(ref) => setModelRefs(m => ({ ...m, duck: ref }))}
                    otherModels={{ duck2: modelRefs.duck2 }}
                    initialPosition={{ x: -1.5, y: 0, z: 0 }}
                    initialRotation={{ x: 0, y: 0, z: 0 }}
                >
                    <Model path="/models/Duck.glb" />
                </Draggable>


                {/* Model #2 */}
                <Draggable
                    modelId="duck2"
                    registerModel={(ref) => setModelRefs(m => ({ ...m, duck2: ref }))}
                    otherModels={{ duck: modelRefs.duck }}
                    initialPosition={{ x: 1.5, y: 0, z: 0 }}
                    initialRotation={{ x: 0, y: 0, z: 0 }}
                >
                    <Model path="/models/Duck.glb" />
                </Draggable>


                <OrbitControls
                    enabled={!topView}
                    enableRotate={!topView}
                    enableZoom={!topView}
                    enablePan={!topView}
                    target={[0, 0, 0]}
                />
            </Canvas>
        </div>
    );
}
