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
    return null;
}

export default function Scene() {
    const [topView, setTopView] = React.useState(false);

    return (
        <div style={{ width: "100%", height: "100vh", background: "#111" }}>
            
            {/* ✅ Dugme */}
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

            <div style={{
                position: "absolute",
                top: 70,
                left: 20,
                zIndex: 10,
                color: "white",
                padding: "6px 10px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "4px",
                fontSize: "14px"
            }}>
            </div>

            {/* ✅ Canvas */}
            <Canvas camera={topView ? { position: [0, 10, 0], fov: 50 } : { position: [3, 3, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                {/* Debug spheres da pokažu obje pozicije */}
<mesh position={[-5, 0.2, 1]}>
  <sphereGeometry args={[0.1]} />
  <meshBasicMaterial color="red" />
</mesh>

<mesh position={[1.5, 0.2, 0]}>
  <sphereGeometry args={[0.1]} />
  <meshBasicMaterial color="blue" />
</mesh>
                <gridHelper args={[20, 20, "white", "gray"]} />

                {/* Model #1 */}
                <Draggable
                    modelId="duck"
                    initialPosition={{ x: -1.5, y: 0, z: 0 }}
                    initialRotation={{ x: 0, y: 0, z: 0 }}
                >
                    <Model path="/models/Duck.glb" />
                </Draggable>

                {/* Model #2 */}
                <Draggable
                    modelId="duck2"
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
                />
            </Canvas>
        </div>
    );
}
