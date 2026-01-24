# ⚙️ Hiring Spark Backend

Unified server for HireSpark, PartnerHB, and Admin management.

---

## 📂 Backend Folder Structure

```text
/backend
├── admin/              # 👑 Centralized Admin Logic
│   ├── controllers/    # API logic for Admin operations
│   ├── routes/         # Endpoint definitions (/api/admin)
│   └── index.js        # Sub-router registry
│
├── hiringBazaar/       # 🏢 Core HiringBazaar Module
│   ├── controllers/    # Job, Candidate, Auth logic
│   ├── models/         # Mongoose Schemas (User, Job, Candidate, etc.)
│   ├── routes/         # Endpoint definitions (/api)
│   └── middlewares/    # Custom auth/validation logic
│
├── partnerHB/          # 🤝 Partner Integration Module
│   ├── controllers/    # Partner-specific logic
│   ├── models/         # Partner and Job Mapping schemas
│   └── routes/         # Endpoint definitions (/api/partner)
│
├── shared/             # 🛠 Common Utilities (Used by all modules)
│   ├── config/         # DB, Mail, and Env configuration
│   ├── middlewares/    # Global middlewares (Upload, Error handler)
│   ├── services/       # External service integrations (Queues)
│   └── workers/        # Background processing (Resume parsing)
│
├── uploads/            # 📁 Storage for resumes and profiles
├── docs/               # 📝 API Documentation
├── server.js           # 🚀 Application entry point
└── package.json        # Dependencies and scripts
```

---

# **Hiring Spark API - Documentation**

## **📌 Base URL**
```
http://localhost:5000/api
```

## **📁 Authentication Required**
All routes (except auth routes) require Bearer Token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## **🔐 AUTHENTICATION ROUTES**

### **1. Register HR**
**Endpoint:** `POST /api/auth/register`  
**No Auth Required**

**Request Body:**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@company.com",
  "phone": "9876543210",
  "password": "Password@123",
  "orgName": "TechCorp Pvt Ltd",
  "address": "Bangalore, Karnataka"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "650a1b2c3d4e5f6g7h8i9j0k",
    "fullName": "Rahul Sharma",
    "email": "rahul@company.com",
    "phone": "9876543210",
    "orgName": "TechCorp Pvt Ltd",
    "role": "HR"
  }
}
```

---

### **2. Login**
**Endpoint:** `POST /api/auth/login`  
**No Auth Required**

**Request Body:**
```json
{
  "email": "rahul@company.com",
  "password": "Password@123"
}
```

**Response:** Same as register

---

### **3. Get Current User**
**Endpoint:** `GET /api/auth/me`  
**Auth Required**

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "650a1b2c3d4e5f6g7h8i9j0k",
    "fullName": "Rahul Sharma",
    "email": "rahul@company.com",
    "phone": "9876543210",
    "orgName": "TechCorp Pvt Ltd",
    "role": "HR",
    "address": "Bangalore, Karnataka"
  }
}
```

---

## **📊 DASHBOARD ROUTES**

### **1. Get Dashboard Statistics**
**Endpoint:** `GET /api/dashboard/stats`  
**Auth Required (HR only)**

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "activeJobs": {
        "value": 12,
        "change": "+3 this week",
        "icon": "📊",
        "color": "blue"
      },
      "totalApplicants": {
        "value": 1234,
        "change": "+156 today",
        "icon": "👥",
        "color": "green"
      },
      "pendingReview": {
        "value": 89,
        "change": "23 urgent",
        "icon": "⏳",
        "color": "orange"
      },
      "hiredThisMonth": {
        "value": 8,
        "change": "+33%",
        "icon": "✅",
        "color": "purple"
      }
    },
    "detailedStats": {
      "jobs": {
        "total": 25,
        "active": 12,
        "draft": 8,
        "pending": 5
      },
      "candidates": {
        "total": 1234,
        "pending": 89,
        "interview": 45,
        "hired": 8,
        "rejected": 1092
      }
    },
    "recentActivities": {
      "jobs": [
        {
          "title": "Senior Developer",
          "company": "TechCorp",
          "status": "posted",
          "time": "2h ago"
        }
      ],
      "candidates": [
        {
          "name": "Amit Patel",
          "email": "amit@email.com",
          "source": "LinkedIn",
          "status": "PENDING",
          "jobTitle": "Senior Developer",
          "time": "30m ago"
        }
      ]
    }
  }
}
```

---

## **💼 JOB ROUTES**

### **1. Create Job Draft**
**Endpoint:** `POST /api/jobs/draft`  
**Auth Required (HR only)**

**Request Body:** Empty `{}`

**Response:**
```json
{
  "success": true,
  "job": {
    "_id": "650a1b2c3d4e5f6g7h8i9j2a",
    "userId": "650a1b2c3d4e5f6g7h8i9j0k",
    "status": "draft",
    "currentStep": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### **2. Update Job - Step 1 (Job Details)**
**Endpoint:** `PUT /api/jobs/:id/step1`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID

**Request Body:**
```json
{
  "jobTitle": "Senior Full Stack Developer",
  "companyName": "TechCorp Pvt Ltd",
  "location": "Bangalore",
  "jobType": "full-time",
  "minExp": 5,
  "maxExp": 10,
  "openings": 3,
  "minSalary": 1500000,
  "maxSalary": 2500000,
  "description": "Job description here...",
  "requirements": ["B.Tech in CS", "5+ years experience"],
  "skills": ["React", "Node.js", "MongoDB"]
}
```

**Response:**
```json
{
  "success": true,
  "job": {
    "_id": "650a1b2c3d4e5f6g7h8i9j2a",
    "currentStep": 2,
    "jobTitle": "Senior Full Stack Developer",
    "companyName": "TechCorp Pvt Ltd",
    // ... all updated fields
  }
}
```

---

### **3. Update Job - Step 2 (Plan Selection)**
**Endpoint:** `PUT /api/jobs/:id/step2`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID

**Request Body:**
```json
{
  "plan": "basic"
}
```
**OR**
```json
{
  "plan": "premium"
}
```

**Response:** Returns updated job with currentStep updated

---

### **4. Update Job - Step 3 (Pricing - Basic Plan Only)**
**Endpoint:** `PUT /api/jobs/:id/step3`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID  
**Required:** Job must have `plan: "basic"`

**Request Body:**
```json
{
  "pricing": [
    {
      "platform": "LinkedIn",
      "pricePerDay": 200,
      "days": 7,
      "total": 1400
    },
    {
      "platform": "Naukri Std",
      "pricePerDay": 400,
      "days": 1,
      "total": 400
    }
  ]
}
```

**Response:** Returns job with pricing and totalAmount calculated

---

### **5. Update Job - Step 4 (Contact Information)**
**Endpoint:** `PUT /api/jobs/:id/step4`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID

**Request Body:**
```json
{
  "contactPerson": "Rahul Sharma",
  "companyEmail": "rahul@techcorp.com",
  "preferredDate": "2024-02-01",
  "note": "Urgent hiring required"
}
```

**Response:** Returns job with status changed to `"pending"`

---

### **6. Get All Jobs (HR's Jobs)**
**Endpoint:** `GET /api/jobs`  
**Auth Required (HR only)**

**Response:**
```json
{
  "success": true,
  "count": 3,
  "jobs": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i9j2a",
      "jobTitle": "Senior Developer",
      "companyName": "TechCorp",
      "status": "posted",
      "currentStep": 4,
      "createdAt": "15 Jan 2024",
      "updatedAt": "16 Jan 2024",
      "applications": 5
    },
    {
      "_id": "650a1b2c3d4e5f6g7h8i9j2b",
      "jobTitle": "Product Manager",
      "companyName": "Innovate",
      "status": "draft",
      "currentStep": 2,
      "createdAt": "14 Jan 2024",
      "updatedAt": "14 Jan 2024",
      "applications": 0
    }
  ]
}
```

---

### **7. Get Single Job**
**Endpoint:** `GET /api/jobs/:id`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID

**Response:** Complete job details

---

### **8. Post Job (Make Job Active)**
**Endpoint:** `PUT /api/jobs/:id/post`  
**Auth Required (HR only)**  
**URL Param:** `id` = Job ID  
**Required:** Job must have `status: "pending"`

**Request Body:** Empty `{}`

**Response:** Job with status changed to `"posted"`

---

## **👥 CANDIDATE ROUTES**

### **1. Add Candidate to Job**
**Endpoint:** `POST /api/candidates`  
**Auth Required (HR only)**  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
jobId: "650a1b2c3d4e5f6g7h8i9j2a"
name: "Amit Patel"
email: "amit.patel@gmail.com"
phoneNumber: "9876543211"
source: "LinkedIn"
resume: [FILE] (PDF/DOC/DOCX, max 5MB)
```

**Response:**
```json
{
  "success": true,
  "candidate": {
    "_id": "650a1b2c3d4e5f6g7h8i9j3a",
    "jobId": "650a1b2c3d4e5f6g7h8i9j2a",
    "name": "Amit Patel",
    "email": "amit.patel@gmail.com",
    "phoneNumber": "9876543211",
    "resumeUrl": "/uploads/resumes/1705300200000-resume.pdf",
    "source": "LinkedIn",
    "hrFeedback": "PENDING",
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### **2. Get Candidates for a Job**
**Endpoint:** `GET /api/candidates/job/:jobId`  
**Auth Required (HR only)**  
**URL Param:** `jobId` = Job ID

**Response:**
```json
{
  "success": true,
  "count": 5,
  "candidates": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i9j3a",
      "name": "Amit Patel",
      "email": "amit.patel@gmail.com",
      "phoneNumber": "9876543211",
      "source": "LinkedIn",
      "hrFeedback": "PENDING",
      "resumeUrl": "/uploads/resumes/1705300200000-resume.pdf",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

---

### **3. Update Candidate Feedback**
**Endpoint:** `PUT /api/candidates/:id/feedback`  
**Auth Required (HR only)**  
**URL Param:** `id` = Candidate ID

**Request Body:**
```json
{
  "hrFeedback": "INTERVIEW_SCHEDULED"
}
```
**Options:** `"PENDING"`, `"INTERVIEW_SCHEDULED"`, `"HIRED"`, `"REJECTED"`

**Response:** Updated candidate

---

### **4. Get HR's All Candidates**
**Endpoint:** `GET /api/candidates/my-candidates`  
**Auth Required (HR only)**

**Response:** All candidates across all jobs of the HR

---

## **📱 PLATFORM ROUTES**

### **1. Get All Platforms**
**Endpoint:** `GET /api/platforms`  
**Auth Required**

**Response:**
```json
{
  "success": true,
  "count": 8,
  "platforms": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i9j1a",
      "name": "LinkedIn",
      "currentPrice": 200,
      "unit": "PER_DAY",
      "isActive": true
    },
    {
      "_id": "650a1b2c3d4e5f6g7h8i9j1b",
      "name": "Naukri Std",
      "currentPrice": 400,
      "unit": "FIXED",
      "isActive": true
    }
  ]
}
```

---

### **2. Get Single Platform**
**Endpoint:** `GET /api/platforms/:id`  
**Auth Required**  
**URL Param:** `id` = Platform ID

**Response:** Single platform details

---

## **📝 SEED DATA**

### **Run Database Seed**
```bash
npm run seed
```

**Creates:**
- 8 Platforms (LinkedIn, Naukri, etc.)
- 2 Plans (Basic, Premium)
- Admin user: `admin@recruit.com` / `Admin@123`
- 3 HR users:
  - `rahul@techcorp.com` / `Password@123`
  - `priya@innovate.com` / `Password@123`
  - `amit@globaltech.com` / `Password@123`

---

## **⚙️ ENVIRONMENT VARIABLES (.env)**

```env
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
PORT=3000
JWT_SECRET=your_super_secret_key_here
```

---

## **📦 API RESPONSE FORMAT**

### **Success Response:**
```json
{
  "success": true,
  "data": {...}  // or specific key like "job", "user", etc.
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### **Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## **🔄 COMPLETE WORKFLOW EXAMPLE**

### **1. HR Registration & Login**
```bash
POST /api/auth/register
POST /api/auth/login
# Save token for all requests
```

### **2. Create Job (Step-by-Step)**
```bash
# Step 1: Create draft
POST /api/jobs/draft
# Save jobId from response

# Step 2: Add job details
PUT /api/jobs/{jobId}/step1

# Step 3: Select plan
PUT /api/jobs/{jobId}/step2

# Step 4: Add pricing (if basic plan)
PUT /api/jobs/{jobId}/step3

# Step 5: Add contact info
PUT /api/jobs/{jobId}/step4

# Step 6: Post job
PUT /api/jobs/{jobId}/post
```

### **3. Add Candidates**
```bash
# Get platforms for reference
GET /api/platforms

# Add candidate with resume
POST /api/candidates (multipart/form-data)

# Update candidate status
PUT /api/candidates/{candidateId}/feedback
```

### **4. View Dashboard & Jobs**
```bash
# Dashboard stats
GET /api/dashboard/stats

# All jobs
GET /api/jobs

# Job candidates
GET /api/candidates/job/{jobId}
```

---

## **🔧 INSTALLATION & RUN**

```bash
# 1. Clone and install
npm install

# 2. Create .env file
echo "MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
PORT=3000
JWT_SECRET=your_secret_key_here" > .env

# 3. Seed database
npm run seed

# 4. Start server
npm run dev
# Server runs on http://localhost:3000
```

---

## **📱 POSTMAN COLLECTION IMPORT**

Import this JSON to Postman:

```json
{
  "info": {
    "name": "HR Recruitment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register HR",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Test HR\",\n  \"email\": \"hr@test.com\",\n  \"phone\": \"9876543210\",\n  \"password\": \"Password@123\",\n  \"orgName\": \"Test Company\",\n  \"address\": \"Test Address\"\n}"
            },
            "url": "{{baseUrl}}/api/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"hr@test.com\",\n  \"password\": \"Password@123\"\n}"
            },
            "url": "{{baseUrl}}/api/auth/login"
          }
        }
      ]
    },
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Get Dashboard Stats",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "url": "{{baseUrl}}/api/dashboard/stats"
          }
        }
      ]
    }
  ]
}
```

---



**Note:** All HR routes require `Bearer Token` in Authorization header.
