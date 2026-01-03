# 🚀 HireSpark Deployment Checklist

## ✅ Pre-Deployment Checklist

### **Local Testing**
- [ ] Backend runs locally (`npm run dev` in `/backend`)
- [ ] Frontend runs locally (`npm run dev` in `/frontend`)
- [ ] Login/Register working
- [ ] Database seeding successful
- [ ] All API endpoints responding
- [ ] No console errors in browser

### **Environment Configuration**
- [ ] Backend `.env` configured (copy from `.env.example`)
- [ ] Frontend `.env` configured (copy from `.env.example`)
- [ ] MongoDB connection string updated
- [ ] JWT secret changed from default
- [ ] Email credentials configured
- [ ] Frontend URL points to production domain

### **Code Quality**
- [ ] No hardcoded `localhost` URLs
- [ ] All environment variables use `process.env` or `import.meta.env`
- [ ] CORS configured for production domain
- [ ] Error handling in place
- [ ] Logging configured

### **Build Testing**
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Built files in `frontend/dist/`
- [ ] No build errors or warnings
- [ ] Test built frontend with `npx serve -s dist`

---

## 🖥️ Server Deployment Steps

### **1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Install PM2, Nginx, Git
sudo npm install -g pm2 serve
sudo apt install -y nginx git
sudo systemctl start nginx && sudo systemctl enable nginx
```

### **2. Clone Repository**
```bash
sudo mkdir -p /var/www/HiringSpark
sudo chown -R $USER:$USER /var/www/HiringSpark
cd /var/www/HiringSpark

# Clone your repo
git clone YOUR_REPO_URL .
```

### **3. Backend Setup**
```bash
cd /var/www/HiringSpark/backend

# Copy and edit .env
cp .env.example .env
nano .env

# Update these values:
# MONGODB_URI=mongodb://localhost:27017/hirespark
# JWT_SECRET=<generate-strong-secret>
# FRONTEND_URL=https://your-domain.com
# EMAIL_USER=your-email
# EMAIL_PASS=your-password

# Install dependencies
npm install --production

# Seed database
node src/seeds/mainSeed.js
```

### **4. Frontend Setup**
```bash
cd /var/www/HiringSpark/frontend

# Copy and edit .env
cp .env.example .env
nano .env

# Update:
# VITE_API_URL=https://your-domain.com/api

# Install and build
npm install
npm run build
```

### **5. Start with PM2**
```bash
# Start backend
cd /var/www/HiringSpark/backend
pm2 start src/server.js --name "hirespark-backend"

# Start frontend
cd /var/www/HiringSpark/frontend
pm2 start "serve -s dist -l 3001" --name "hirespark-frontend"

# Save PM2 config
pm2 save
pm2 startup
# Run the command it outputs
```

### **6. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/hirespark
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads {
        alias /var/www/HiringSpark/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/hirespark /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### **7. Configure Firewall**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable
```

### **8. Setup SSL (Optional but Recommended)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## ✅ Post-Deployment Verification

### **Check Services**
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# MongoDB status
sudo systemctl status mongod

# Check logs
pm2 logs hirespark-backend --lines 20
pm2 logs hirespark-frontend --lines 20
```

### **Test Endpoints**
```bash
# Test backend health
curl http://localhost:5000/

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruit.com","password":"admin123"}'
```

### **Browser Testing**
- [ ] Visit `https://your-domain.com`
- [ ] Frontend loads without errors
- [ ] Login page accessible
- [ ] Can login with admin credentials
- [ ] Dashboard loads
- [ ] No console errors

---

## 🔄 Update Procedure

```bash
cd /var/www/HiringSpark

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart hirespark-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart hirespark-frontend

# Check status
pm2 status
```

---

## 🐛 Troubleshooting

### **Backend not starting**
```bash
pm2 logs hirespark-backend --err
# Check .env file exists and has correct values
cat backend/.env
```

### **Frontend shows blank page**
```bash
# Check if dist folder exists
ls -la frontend/dist/
# Rebuild if needed
cd frontend && npm run build
```

### **Login not working**
```bash
# Check backend logs
pm2 logs hirespark-backend

# Test database connection
mongosh hirespark --eval "db.users.find({ email: 'admin@recruit.com' })"

# Reseed if needed
cd backend && node src/seeds/mainSeed.js
```

### **502 Bad Gateway**
```bash
# Check if backend is running
pm2 status
# Check Nginx config
sudo nginx -t
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Admin Credentials

**Default Admin:**
- Email: `admin@recruit.com`
- Password: `admin123`

**⚠️ IMPORTANT: Change admin password immediately after first login!**

---

## 🎯 Success Criteria

- ✅ Application accessible via domain
- ✅ HTTPS working (if SSL configured)
- ✅ Login/Register functional
- ✅ Dashboard loads
- ✅ API calls working
- ✅ No console errors
- ✅ PM2 processes running
- ✅ MongoDB connected
- ✅ Nginx serving correctly

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Domain:** _____________  
**Server IP:** _____________
