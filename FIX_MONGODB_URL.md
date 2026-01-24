# 🔧 Fix MongoDB URL - Manual Steps

## Problem
Backend is connecting to `jobportal` database instead of `HiringBazaar`

## Solution

### **Update backend/.env file:**

```bash
cd backend
```

**Open `.env` file and update these lines:**

```env
# Change this:
MONGODB_URI=mongodb://localhost:27017/jobportal
MONGO_URI=mongodb://localhost:27017/jobportal

# To this:
MONGODB_URI=mongodb://localhost:27017/HiringBazaar
MONGO_URI=mongodb://localhost:27017/HiringBazaar
```

### **Complete .env file should look like:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/HiringBazaar
MONGO_URI=mongodb://localhost:27017/HiringBazaar
JWT_SECRET=HiringBazaar-super-secret-jwt-key-change-this-in-production-2024

ADMIN_EMAIL=admin@HiringBazaar.com
ADMIN_PASSWORD=admin123

EMAIL_USER=hiringbazaarconnects@gmail.com
EMAIL_PASS=ncepqkrngsvmlwup

FRONTEND_URL=http://localhost:5173
```

### **After updating, restart backend:**

```bash
# Stop current backend (Ctrl+C)
# Then restart:
npm run dev
```

### **Verify:**

You should see:
```
📦 MongoDB: mongodb://localhost:27017/HiringBazaar
✅ MongoDB Connected: localhost
```

---

## ✅ **All Fixes Applied**

1. ✅ `server.js` - Changed default from jobportal to HiringBazaar
2. ✅ `User.js` - Removed duplicate email index warning
3. ✅ `.env.example` - Updated to HiringBazaar
4. ⏳ `.env` - **YOU NEED TO UPDATE THIS MANUALLY**

---

**After updating .env, backend will connect to HiringBazaar database! 🚀**
