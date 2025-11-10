"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "./Model";
import Draggable from "./Draggable";
import React from "react";

function TopViewController({ topView }: { topView: boolean }) {
    useFrame(({ camera }) => {
        if (topView) {
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
        }
    });

    return null; // this component only controls the camera
}

export default function Scene() {
    const [topView, setTopView] = React.useState(false);

    return (
        <div style={{ width: "100%", height: "100vh", background: "#111" }}>
            <button
                onClick={() => setTopView(!topView)}
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    padding: "10px 20px",
                    background: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    zIndex: 10,
                }}
            >
                {topView ? "Switch to 3D View" : "Switch to Top View"}
            </button>

            <Canvas
                camera={
                    topView
                        ? { position: [0, 10, 0], fov: 50 }
                        : { position: [3, 3, 3], fov: 50 }
                }
            >
                <TopViewController topView={topView} />

                {/* Light */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />

                {/* GRID */}
                <gridHelper args={[20, 20, "white", "gray"]} />

                {/* Model */}
                <Draggable modelId="duck">
                    <Model path="/models/Duck.glb" />
                </Draggable>

                {/* Controls */}
                <OrbitControls
                    enabled={!topView}
                    enableRotate={!topView}
                    enableZoom={!topView}
                    enablePan={!topView}
                />
            </Canvas>
        </div>
    );
}
