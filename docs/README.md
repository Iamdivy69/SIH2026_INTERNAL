# PARAKH AI - Local Setup Guide

PARAKH AI is an adaptive assessment platform featuring an Express/Node.js backend with MongoDB and Groq LLM integration, and a modern React (Vite + Tailwind CSS) frontend.

---

## 📋 Prerequisites

Before running the project locally, ensure you have installed:
1. **[Node.js](https://nodejs.org/)** (v18+ recommended) & **npm**
2. **MongoDB** (Local instance running at `mongodb://localhost:27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
3. **[Groq API Key](https://console.groq.com/keys)** (Optional/Required for AI question generation & adaptive features)

---

## ⚙️ 1. Environment Configuration

### Backend Setup
1. Open the [backend/.env](file:///d:/Parakh-ai/Parakh-ai/backend/.env) file (or copy from [backend/.env.example](file:///d:/Parakh-ai/Parakh-ai/backend/.env.example)):
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Configure the following variables in `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/parakh-ai
   # Or MongoDB Atlas:
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/parakh-ai?retryWrites=true&w=majority

   JWT_SECRET=parakh-ai-super-secret-jwt-key-change-this-in-production
   LLM_API_KEY=your-groq-api-key-here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

### Frontend Setup
1. Verify [frontend/.env](file:///d:/Parakh-ai/Parakh-ai/frontend/.env) contains:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

---

## 📦 2. Install Dependencies

Install all dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 🗄️ 3. Seed Database (Optional / Recommended)

To populate sample questions and test accounts:

1. **Seed Questions:**
   ```bash
   npm run seed:questions
   ```
2. **Seed Admin & Sample Students:**
   ```bash
   npm run seed:admin
   ```

---

## 🚀 4. Run the Project

### Option A: Run Both Backend & Frontend Simultaneously (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Option B: Run Individually
- **Backend only:**
  ```bash
  npm run dev:backend
  ```
- **Frontend only:**
  ```bash
  npm run dev:frontend
  ```

---

## 🛠️ Available Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts both backend (nodemon) & frontend (vite) concurrently |
| `npm run dev:backend` | Starts backend with nodemon on port 5000 |
| `npm run dev:frontend` | Starts frontend Vite dev server on port 5173 |
| `npm run install:all` | Installs root, backend, and frontend dependencies |
| `npm run seed:questions` | Populates BST/AVL question bank in MongoDB |
| `npm run seed:admin` | Seeds admin and demo student users |
| `npm run build` | Builds the frontend for production |
