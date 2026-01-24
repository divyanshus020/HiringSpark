# 📊 User Model Documentation

## Overview
The User model supports both **Admin** and **HR** users with role-based field requirements.

---

## 🗂️ Schema Structure

### **Common Fields (Required for All)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | String | ✅ Yes | User's full name |
| `email` | String | ✅ Yes | Unique email (lowercase, trimmed) |
| `password` | String | ✅ Yes | Hashed password |
| `role` | String | ✅ Yes | Either 'ADMIN' or 'HR' |
| `isActive` | Boolean | No | Default: true |

### **HR-Specific Fields (Required only for HR)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | String | ✅ For HR | Contact number |
| `companyName` | String | ✅ For HR | Company name |
| `address` | String | ✅ For HR | Company address |
| `orgName` | String | No | Legacy field (optional) |

### **Admin-Specific Fields**
Admin users don't require `phone`, `companyName`, or `address`. These fields are automatically set to default values during admin creation.

### **Password Reset Fields**
| Field | Type | Description |
|-------|------|-------------|
| `resetPasswordToken` | String | Hashed reset token |
| `resetPasswordExpire` | Date | Token expiration time |

### **Metadata Fields**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `lastLogin` | Date | - | Last login timestamp |
| `loginCount` | Number | 0 | Total login count |
| `createdAt` | Date | Auto | Account creation date |
| `updatedAt` | Date | Auto | Last update date |

---

## 🔧 Virtual Properties

### `isAdmin`
Returns `true` if user role is 'ADMIN'
```javascript
if (user.isAdmin) {
  // Admin-specific logic
}
```

### `isHR`
Returns `true` if user role is 'HR'
```javascript
if (user.isHR) {
  // HR-specific logic
}
```

---

## 📌 Indexes

For optimized queries:
- `email` (unique index)
- `role` (for role-based queries)
- `isActive` (for filtering active users)

---

## 🛠️ Instance Methods

### `updateLoginInfo()`
Updates login metadata when user logs in
```javascript
await user.updateLoginInfo();
```

---

## 🔒 Security Features

### **Password Exclusion**
Password and reset tokens are automatically excluded from JSON responses:
```javascript
const userJSON = user.toJSON();
// password, resetPasswordToken, resetPasswordExpire are NOT included
```

---

## 📝 Example Documents

### **Admin User**
```json
{
  "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "fullName": "Admin User",
  "email": "admin@HiringBazaar.com",
  "role": "ADMIN",
  "phone": "0000000000",
  "companyName": "HiringBazaar Admin",
  "address": "Admin Office",
  "isActive": true,
  "lastLogin": "2026-01-04T00:00:00.000Z",
  "loginCount": 5,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-04T00:00:00.000Z",
  "isAdmin": true,
  "isHR": false
}
```

### **HR User**
```json
{
  "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
  "fullName": "John Doe",
  "email": "john@techcorp.com",
  "role": "HR",
  "phone": "9876543210",
  "companyName": "TechCorp Solutions",
  "address": "123 Tech Street, Mumbai",
  "isActive": true,
  "lastLogin": "2026-01-04T00:00:00.000Z",
  "loginCount": 12,
  "createdAt": "2026-01-02T00:00:00.000Z",
  "updatedAt": "2026-01-04T00:00:00.000Z",
  "isAdmin": false,
  "isHR": true
}
```

---

## 🔍 Query Examples

### **Find All Admins**
```javascript
const admins = await User.find({ role: 'ADMIN', isActive: true });
```

### **Find All Active HRs**
```javascript
const hrs = await User.find({ role: 'HR', isActive: true });
```

### **Find User by Email**
```javascript
const user = await User.findOne({ email: 'admin@HiringBazaar.com' });
```

### **Count Total Users by Role**
```javascript
const adminCount = await User.countDocuments({ role: 'ADMIN' });
const hrCount = await User.countDocuments({ role: 'HR' });
```

---

## ⚙️ Validation Rules

### **Email**
- Must be unique
- Automatically converted to lowercase
- Whitespace trimmed

### **Phone** (HR only)
- Required for HR users
- Optional for Admin users

### **Company Name** (HR only)
- Required for HR users
- Not required for Admin users

### **Address** (HR only)
- Required for HR users
- Not required for Admin users

---

## 🚀 Usage in Controllers

### **Creating Admin**
```javascript
const admin = await User.create({
  fullName: 'Admin User',
  email: 'admin@HiringBazaar.com',
  password: hashedPassword,
  role: 'ADMIN',
  phone: '0000000000', // Default
  companyName: 'HiringBazaar Admin',
  address: 'Admin Office'
});
```

### **Creating HR**
```javascript
const hr = await User.create({
  fullName: 'John Doe',
  email: 'john@techcorp.com',
  password: hashedPassword,
  role: 'HR',
  phone: '9876543210',
  companyName: 'TechCorp Solutions',
  address: '123 Tech Street'
});
```

### **Update Login Info**
```javascript
// In login controller
const user = await User.findOne({ email });
if (user) {
  await user.updateLoginInfo();
}
```

---

## 🔄 Migration Notes

If you have existing users in the database:

1. **Phone field**: Existing HR users should already have phone
2. **CompanyName**: May need to migrate from `orgName` if used
3. **Admin users**: Will need default values for phone, companyName, address

### **Migration Script Example**
```javascript
// Update all admin users with default values
await User.updateMany(
  { role: 'ADMIN' },
  {
    $set: {
      phone: '0000000000',
      companyName: 'HiringBazaar Admin',
      address: 'Admin Office'
    }
  }
);
```

---

**Last Updated:** January 4, 2026
