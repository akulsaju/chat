# 💬 ChatFlow – A Slack Alternative

ChatFlow is a modern, lightweight communication platform built for teams, communities, and student groups. It provides real-time messaging, organized channels, and collaboration tools — without the complexity and cost of traditional platforms.

## 🚀 Features

- 💬 **Real-time Messaging** – Instant chat with WebSocket support
- 📢 **Channels & Topics** – Organize conversations by teams or projects
- 👥 **Direct Messages** – Private 1-on-1 communication
- 📎 **File Sharing** – Upload and share files easily
- 🌙 **Dark Mode** – Clean UI for long usage
- 🔐 **Authentication** – Secure login & user sessions with JWT

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Zustand |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
chatflow/
├── frontend/        # Next.js app (deploy to Vercel)
├── backend/         # Express + Socket.IO API (deploy to Railway)
├── database/        # Seed script
├── vercel.json      # Vercel deployment config (frontend)
└── .env             # Local env vars
```

## 📦 Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Copy and fill in environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit both files with your values

# 3. Seed the database (optional)
npm run seed

# 4. Start both servers
npm run dev
```

The frontend runs on **http://localhost:3001** and the backend on **http://localhost:3000**.

## ☁️ Deployment (Vercel + Railway)

ChatFlow uses two services because Socket.IO requires persistent WebSocket connections that serverless functions don't support:

- **Frontend → Vercel** (free tier works great for Next.js)
- **Backend → Railway** (free tier, supports WebSockets)

### Step 1 — Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Create a database user and allow connections from anywhere (`0.0.0.0/0`)
3. Copy the connection string — you'll need it in Steps 2 and 3

### Step 2 — Deploy the Backend to Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Click **Deploy from GitHub repo** → select this repo
3. Set the **Root Directory** to `backend`
4. Add these **Environment Variables** in Railway:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `CLIENT_URL` | Your Vercel frontend URL (add after Step 3) |
| `PORT` | `3000` |

5. After deploy, copy your Railway backend URL (e.g., `https://chatflow-backend.up.railway.app`)

### Step 3 — Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and create a new project
2. Import this GitHub repo
3. In **Configure Project**, set:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add these **Environment Variables** in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
| `NEXT_PUBLIC_SOCKET_URL` | Your Railway backend URL |

5. Click **Deploy** — Vercel will build and publish the frontend
6. Copy your Vercel URL (e.g., `https://chatflow.vercel.app`)

### Step 4 — Connect Frontend ↔ Backend

1. Go back to Railway → your backend service → **Variables**
2. Set `CLIENT_URL` to your Vercel frontend URL
3. Redeploy the backend (Railway does this automatically on variable change)

Your app is now live! 🎉

### Step 5 — Seed the Database (Optional)

To add sample users and channels to your production database:

```bash
# Set MONGODB_URI in your local .env then run:
MONGODB_URI="your_atlas_connection_string" npm run seed
```

Sample accounts (password: `password123`):
- `alice@chatflow.dev`
- `bob@chatflow.dev`
- `charlie@chatflow.dev`

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/chatflow
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.up.railway.app
```

## 📌 Roadmap

- [ ] Voice & Video Calls
- [ ] Threaded Conversations
- [ ] Mobile App (React Native)
- [ ] Cloud file storage (Cloudinary / S3)
- [ ] AI Chat Assistant

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature-name
git commit -m "Add feature"
# Push and open a PR
```

## 📄 License

MIT License – feel free to use and modify.

---

*Built as a simple, open alternative to team communication tools, especially for students, hackathons, and small teams.*
