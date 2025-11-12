# 🦆 3D Model Management App

A mini 3D web app built with **Next.js**, **Three.js**, **React Three Fiber**, and **Firebase Firestore**.
The app allows users to load, move, and rotate 3D models while saving their state to the Firestore database.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

Create a `.env.local` file with your Firebase configuration:

```bash
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
```

### 3. Run the development server

```bash
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧩 Features

* Load two `.glb` 3D models
* Drag models within the scene (no overlap allowed)
* Edit model rotation using a slider and numeric input
* Save position and rotation to **Firestore** instantly
* Restore model state on reload
* Switch between **3D view** and **2D top-down view** using a toggle button

---

## 🧠 Optional Enhancements

(Added beyond task requirements for better UX)

* `onPointerMissed` – deselects models when clicking on empty space
* Global `pointerup` listener – prevents dragging issues
* Conditional outline highlighting of the selected model
* Glassmorphism UI styling for a clean, modern look

---

## 📜 Task Compliance

All requirements from **Task 1** are fulfilled:

✅ Two GLB models
✅ 3D and 2D scene views
✅ Draggable & rotatable models
✅ Prevent overlapping
✅ Firestore save/load without authentication
✅ No active listeners

---

## 🛠️ Tech Stack

* **Next.js** (React framework)
* **Three.js + React Three Fiber** for 3D rendering
* **Firebase Firestore** for database storage
* **@react-three/postprocessing** for model outline effect
* **CSS Modules** for UI styling

---

### 📁 Project Structure

See `/app/components` for main logic and `/firebase` for database integration.