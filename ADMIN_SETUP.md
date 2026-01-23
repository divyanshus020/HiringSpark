# 🔐 Admin Authentication - Postman Guide

## Create First Admin User

Since there's no admin registration page in the frontend, you need to create the first admin using Postman.

---

## 📮 **Postman Request: Create Admin**

### **Endpoint**
```
POST http://localhost:5000/api/auth/admin/register
```

### **Headers**
```
Content-Type: application/json
```

### **Body (JSON)**
```json
{
  "fullName": "Admin User",
  "email": "admin@HiringBazaar.com",
  "password": "Admin@123"
}
```

### **Expected Response (201 Created)**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Admin User",
    "email": "admin@HiringBazaar.com",
    "role": "ADMIN"
  }
}
```

---

## 🔑 **Test Admin Login**

### **Endpoint**
```
POST http://localhost:5000/api/auth/admin/login
```

### **Headers**
```
Content-Type: application/json
```

### **Body (JSON)**
```json
{
  "email": "admin@HiringBazaar.com",
  "password": "Admin@123"
}
```

### **Expected Response (200 OK)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Admin User",
    "email": "admin@HiringBazaar.com",
    "role": "ADMIN"
  }
}
```

---

## 🌐 **Frontend Admin Login**

After creating admin via Postman, you can login through the frontend:

**URL:** `http://localhost:5173/admin`

**Credentials:**
- Email: `admin@HiringBazaar.com`
- Password: `Admin@123`

---

## 🚀 **Production Deployment**

### **Step 1: Create Admin on Server**

```bash
# SSH into server
ssh root@your-server-ip

# Use curl to create admin
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@HiringBazaar.com",
    "password": "YourStrongPassword123!"
  }'
```

### **Step 2: Login via Frontend**

Visit: `https://your-domain.com/admin`

---

## 🔒 **Security Notes**

1. **Change Default Password**: Immediately change the admin password after first login
2. **Strong Password**: Use a strong password with uppercase, lowercase, numbers, and special characters
3. **Limit Admin Accounts**: Only create admin accounts for trusted personnel
4. **No Public Registration**: Admin registration endpoint should be disabled in production or protected

---

## ⚠️ **Production Security Recommendation**

### **Disable Admin Registration in Production**

Add this to `authRoutes.js`:

```javascript
// Admin Routes
if (process.env.NODE_ENV !== 'production') {
  router.post('/admin/register', adminRegister);
}
router.post('/admin/login', adminLogin);
```

This ensures admin registration is only available in development mode.

---

## 📊 **API Endpoints Summary**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/admin/register` | Create admin user | Postman/Dev Only |
| POST | `/api/auth/admin/login` | Admin login | Frontend + API |
| POST | `/api/auth/register` | HR registration | Frontend |
| POST | `/api/auth/login` | HR login | Frontend |

---

## 🧪 **Testing Checklist**

- [ ] Create admin via Postman
- [ ] Verify admin created in database
- [ ] Test admin login via Postman
- [ ] Test admin login via frontend
- [ ] Verify admin dashboard access
- [ ] Test HR login (should not access admin panel)
- [ ] Test admin role validation

---

## 💡 **Example: Create Multiple Admins**

```bash
# Admin 1
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@HiringBazaar.com",
    "password": "SecurePass123!"
  }'

# Admin 2
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@HiringBazaar.com",
    "password": "SecurePass456!"
  }'
```

---

**Created:** January 4, 2026  
**Last Updated:** January 4, 2026
