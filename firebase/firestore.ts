import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type VectorData = {
  x: number;
  y: number;
  z: number;
};

export async function saveModelState(
  modelId: string,
  position: VectorData,
  rotation: VectorData
) {
  await setDoc(doc(db, "models", modelId), {
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    rotation: {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
    },
  });
}

export async function loadModelState(modelId: string) {
  const snap = await getDoc(doc(db, "models", modelId));
  return snap.exists() ? (snap.data() as { position: VectorData; rotation: VectorData }) : null;
}