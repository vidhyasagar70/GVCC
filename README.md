# MERN Learning Portal

A premium, clean, hyper-minimalist monochrome learning platform built with React, Vite, TypeScript, Tailwind CSS, Express, and MongoDB.

## 🚀 Live Deployments

*   **Frontend (Vercel)**: [https://gvcc-sigma.vercel.app/](https://gvcc-sigma.vercel.app/)
*   **Backend API (Render)**: [https://gvcc-3ivq.onrender.com/](https://gvcc-3ivq.onrender.com/)
*   **API Health**: [https://gvcc-3ivq.onrender.com/health](https://gvcc-3ivq.onrender.com/health)

---

## 🛠️ Features

*   **Premium Monochrome Theme**: High-end minimalist design similar to Linear and Vercel documentation.
*   **HTML5 Custom Video Player**: Custom timeline progress bar, speed control menu, and volume controls.
*   **DRM Screenshot Protection**: Multi-layered screenshot defense (visibility events, blur overlays, context menu blocks, key interceptions, and print stylesheet injections).
*   **Bookmark Engine**: Create timestamped notes for videos that support deep-linking playback and optimistic UI rollbacks.

---

## 📡 Database Seeding

To seed the live MongoDB Atlas database with the 5 course lessons, send a `POST` request to the backend's seed endpoint:

```bash
# Using PowerShell
Invoke-RestMethod -Uri "https://gvcc-3ivq.onrender.com/api/videos/seed" -Method POST

# Using terminal curl
curl -X POST https://gvcc-3ivq.onrender.com/api/videos/seed
```

---

## ⚙️ Setup & Configuration

### CORS Configuration
The backend allows cross-origin requests dynamically from the Vercel app. It is configured in [server/src/app.ts](file:///server/src/app.ts):
```typescript
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true
  })
);
```

### Static Video Assets
Video streaming uses MP4 chunks. The backend serves local static assets from the `server/public/videos/` directory:
```typescript
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));
```
The frontend automatically prepends the backend base URL to these routes when running in production to ensure seamless video loads.
