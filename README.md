# 🎯 HireSpark - Recruitment Ecosystem

Comprehensive documentation of the project's architecture, folder structure, and module responsibilities.

---

## 🏗 Project Architecture
The project is divided into two main parts:
1.  **Backend**: Node.js/Express with MongoDB, providing a unified API for Admin, HR, and Partners.
2.  **Frontend**: React (Vite) with TypeScript, featuring dedicated dashboards for Admin and HR users.

---

## 📂 Folder Structure

### 1. 🌐 Root Directory
```text
/HiringSpark
├── backend/            # Express.js Server
├── frontend/           # React App
├── DEPLOYMENT_GUIDE.md # Server setup instructions
└── README.md           # This file
```

---

### 2. ⚙️ Backend (`/backend`)
Unified system for handling multiple recruitment modules.

```text
/backend
├── admin/              # 👑 Centralized Admin Logic
│   ├── controllers/    # Admin stats, HR management, Partner approvals
│   ├── routes/         # Routes mounted at /api/admin
│   └── index.js        # Admin Master Router
│
├── hiringBazaar/       # 🏢 Core HiringBazaar Module
│   ├── controllers/    # Job and Candidate controllers
│   ├── models/         # Database Schemas (User, Job, Candidate, etc.)
│   ├── routes/         # Routes mounted at /api
│   └── middlewares/    # Auth and Role checking
│
├── partnerHB/          # 🤝 Partner Integration Module
│   ├── controllers/    # Partner Auth & Job submission
│   ├── models/         # Partner and Mapping schemas
│   └── routes/         # Routes mounted at /api/partner
│
├── shared/             # 🛠 Common Utilities
│   ├── config/         # Database, Email, and Env config
│   ├── middlewares/    # Global File uploads (Multer)
│   ├── services/       # BullMQ queues
│   └── workers/        # AI Resume Parsing workers
│
├── uploads/            # 📁 Static File Storage (Resumes/Profiles)
├── docs/               # 📝 API Documentation (API_DOCUMENTATION.md)
├── server.js           # 🚀 Server entry point
└── package.json        # Dependencies & Scripts
```

---

### 3. 🎨 Frontend (`/frontend`)
TypeScript-based React application with module-based routing.

```text
/frontend/src
├── admin/              # 👑 Admin Dashboard Module
│   ├── Dashboard.tsx   # Stats and overview
│   ├── Partners.tsx    # Partner management tool
│   ├── HRAccounts.tsx  # HR user management
│   └── AdminApp.tsx    # Admin specific routing
│
├── hr/                 # 🏢 HR Dashboard Module
│   ├── Dashboard.tsx   # HR specific stats
│   ├── JobPostings.tsx # Job creation/management
│   └── HRApp.tsx       # HR specific routing
│
├── api/                # 📡 API Client Layer
│   ├── axios.ts        # Instance config with interceptors
│   ├── admin/          # Admin endpoint definitions
│   └── hr/             # HR/Candidate endpoint definitions
│
├── components/         # 🧱 Reusable UI Components
│   ├── ui/             # Radix UI + Tailwind base components
│   ├── layout/         # Sidebar, Header, and Page wrappers
│   └── dashboard/      # Stat cards and charts
│
├── hooks/              # ⚓ Custom React Hooks
├── lib/                # 🧰 Shared utilities (utils.ts)
├── App.tsx             # 🧭 Main Router (Routing between Admin/HR)
└── main.tsx            # 🚀 Entry point
```

---

## 🚀 Getting Started

### Backend Setup
1.  Navigate to `backend/`
2.  Install dependencies: `npm install`
3.  Configure `.env` (using `.env.example`)
4.  Run: `npm run dev`

### Frontend Setup
1.  Navigate to `frontend/`
2.  Install dependencies: `npm install`
3.  Run: `npm run dev`

---

## 🛡 Authentication Flow
- **Admin**: Accessible via `/admin/auth`. Uses JWT for role-based access.
- **HR**: Accessible via `/hr/auth`. Standard login/registration.
- **Partner**: Standalone registration via `/api/partner/auth/register` (Requires Admin approval).

---

## 📡 API Endpoints
Check `backend/docs/API_DOCUMENTATION.md` for a complete list of 59+ available APIs.
