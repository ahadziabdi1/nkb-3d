"use client";

import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React, { createContext, useRef, useState, useEffect } from "react";
import Draggable from "./Draggable";
import Model from "./Model";
import { saveModelState } from "../../firebase/firestore";

// ✅ Context za modele — Draggable ih čita
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

  // ✅ Globalni registry
  const modelsRef = useRef<Record<string, THREE.Object3D | null>>({
    duck: null,
    duck2: null,
  });

  // ✅ UI rotacija — mora se syncati nakon load-a
  const [uiRot, setUiRot] = useState<Record<string, number>>({
    duck: 0,
    duck2: 0,
  });

  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // ✅ Koristi se kad Draggable javi “hej, učitao sam rotation iz Firestore”
  const syncUiRotation = (id: string, radY: number) => {
    setUiRot((s) => ({ ...s, [id]: Math.round(toDeg(radY)) }));
  };

  // ✅ UI → mijenja rotaciju modela
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
      <div style={{ width: "100%", height: "100vh", background: "#111" }}>
        <button
          onClick={() => setTopView((v) => !v)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px 20px",
            background: "#fff",
            borderRadius: 6,
            zIndex: 10,
          }}
        >
          {topView ? "Switch to 3D View" : "Switch to Top View"}
        </button>

        {/* ✅ UI Panel */}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 20,
            padding: 12,
            width: 280,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 8,
            color: "#fff",
            zIndex: 10,
          }}
        >
          <h4>Rotation Panel</h4>

          {["duck", "duck2"].map((id) => (
            <div key={id} style={{ marginBottom: 20 }}>
              <strong>{id}</strong>

              <input
                type="range"
                min={0}
                max={360}
                value={uiRot[id]}
                onChange={(e) => setRotationYDeg(id, Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />

              <input
                type="number"
                min={0}
                max={360}
                value={uiRot[id]}
                onChange={(e) => setRotationYDeg(id, Number(e.target.value))}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 6,
                  background: "#222",
                  borderRadius: 6,
                  border: "1px solid #555",
                  color: "#fff",
                }}
              />
            </div>
          ))}
        </div>

        {/* ✅ Canvas */}
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <TopViewController topView={topView} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <gridHelper args={[20, 20]} />

          <Draggable
            modelId="duck"
            registerModel={(ref) => (modelsRef.current.duck = ref)}
            initialPosition={{ x: -1.5, y: 0, z: 0 }}
            onLoadRotation={(rad) => syncUiRotation("duck", rad)}
          >
            <Model path="/models/Duck.glb" />
          </Draggable>

          <Draggable
            modelId="duck2"
            registerModel={(ref) => (modelsRef.current.duck2 = ref)}
            initialPosition={{ x: 1.5, y: 0, z: 0 }}
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
        </Canvas>
      </div>
    </ModelsContext.Provider>
  );
}
