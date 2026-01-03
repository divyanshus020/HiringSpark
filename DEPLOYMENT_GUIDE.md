# 🚀 HireSpark - KVM Deployment Guide

Complete step-by-step guide to deploy HireSpark (MERN Stack) on KVM server.

---

## 📋 Prerequisites

- KVM server with Ubuntu 20.04/22.04
- Root or sudo access
- Domain name (optional but recommended)
- SSH access to server

---

## 🔧 Part 1: Server Setup

### 1. Connect to KVM Server

```bash
ssh root@your-server-ip
# OR
ssh username@your-server-ip
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js (v18 LTS)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 4. Install MongoDB

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### 5. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 6. Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. Install Git

```bash
sudo apt install -y git
```

---

## 📦 Part 2: Deploy Application

### 1. Create Application Directory

```bash
sudo mkdir -p /var/www/hirespark
sudo chown -R $USER:$USER /var/www/hirespark
cd /var/www/hirespark
```

### 2. Clone Your Repository

```bash
# If using Git
git clone https://github.com/your-username/hirespark.git .

# OR upload files via SCP from local machine
# From your local machine (Windows):
# scp -r C:\Divyanshu\Divyanshu\Project\HiringBazar\HireSpark\HiringSpark\* username@server-ip:/var/www/hirespark/
```

### 3. Setup Backend

```bash
cd /var/www/hirespark/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Backend `.env` file:**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/hirespark
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Seed Data
ADMIN_EMAIL=admin@hirespark.com
ADMIN_PASSWORD=admin123

# Email Configuration
EMAIL_USER=hiringbazaarconnects@gmail.com
EMAIL_PASS=ncepqkrngsvmlwup

# Frontend URL
FRONTEND_URL=http://your-domain.com
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

### 4. Setup Frontend

```bash
cd /var/www/hirespark/frontend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Frontend `.env` file:**
```env
VITE_API_URL=http://your-domain.com/api
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

### 5. Build Frontend

```bash
cd /var/www/hirespark/frontend
npm run build
```

---

## 🔄 Part 3: Start Applications with PM2

### 1. Start Backend

```bash
cd /var/www/hirespark/backend

# Start with PM2
pm2 start npm --name "hirespark-backend" -- start

# OR if you have a server.js file
pm2 start server.js --name "hirespark-backend"
```

### 2. Serve Frontend with PM2 (using serve)

```bash
# Install serve globally
sudo npm install -g serve

# Start frontend
cd /var/www/hirespark/frontend
pm2 start "serve -s dist -l 3000" --name "hirespark-frontend"
```

### 3. Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Copy and run the command it outputs
```

### 4. Check PM2 Status

```bash
pm2 status
pm2 logs hirespark-backend
pm2 logs hirespark-frontend
```

---

## 🌐 Part 4: Configure Nginx

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hirespark
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
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
        alias /var/www/hirespark/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hirespark /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Part 5: Setup SSL (Optional but Recommended)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts and select option 2 to redirect HTTP to HTTPS.

---

## 🗄️ Part 6: Database Setup

### 1. Seed Admin User

```bash
cd /var/www/hirespark/backend
node src/seeds/mainSeed.js
```

### 2. MongoDB Security (Optional)

```bash
# Create admin user
mongosh

use admin
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use hirespark
db.createUser({
  user: "hirespark_user",
  pwd: "your-strong-password",
  roles: [ { role: "readWrite", db: "hirespark" } ]
})

exit
```

Update `MONGO_URI` in backend `.env`:
```env
MONGO_URI=mongodb://hirespark_user:your-strong-password@localhost:27017/hirespark
```

Restart backend:
```bash
pm2 restart hirespark-backend
```

---

## 🔥 Part 7: Firewall Setup

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📊 Part 8: Monitoring & Maintenance

### PM2 Commands

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart apps
pm2 restart all
pm2 restart hirespark-backend
pm2 restart hirespark-frontend

# Stop apps
pm2 stop all

# Delete apps
pm2 delete all
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### MongoDB Commands

```bash
# Check status
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 Part 9: Update/Redeploy

### Update Code

```bash
cd /var/www/hirespark

# Pull latest changes
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
```

---

## 🐛 Troubleshooting

### Check if ports are in use

```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000
```

### Check application logs

```bash
pm2 logs hirespark-backend --lines 100
pm2 logs hirespark-frontend --lines 100
```

### Restart everything

```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### Check disk space

```bash
df -h
```

### Check memory usage

```bash
free -m
```

---

## 📝 Quick Reference

### Important Directories

- Application: `/var/www/hirespark`
- Nginx config: `/etc/nginx/sites-available/hirespark`
- Nginx logs: `/var/log/nginx/`
- MongoDB data: `/var/lib/mongodb`
- PM2 logs: `~/.pm2/logs/`

### Important URLs

- Frontend: `http://your-domain.com`
- Backend API: `http://your-domain.com/api`
- Admin Login: `http://your-domain.com/admin/login`
- HR Login: `http://your-domain.com/hr/login`

---

## ✅ Post-Deployment Checklist

- [ ] Backend running on PM2
- [ ] Frontend built and served
- [ ] Nginx configured and running
- [ ] MongoDB running and secured
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Admin user seeded
- [ ] Email notifications working
- [ ] All routes accessible
- [ ] PM2 startup configured

---

## 🎉 Deployment Complete!

Your HireSpark application is now live!

**Access your application:**
- Frontend: http://your-domain.com
- Admin Panel: http://your-domain.com/admin
- HR Panel: http://your-domain.com/hr

**Default Admin Credentials:**
- Email: admin@hirespark.com
- Password: admin123

**⚠️ Important:** Change admin password immediately after first login!

---

## 📞 Support

For issues or questions:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

---

**Happy Deploying! 🚀**
