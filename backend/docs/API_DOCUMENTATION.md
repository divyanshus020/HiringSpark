# HiringBazaar Complete API Documentation

**Base URL:** `http://localhost:5000`

---

## 📋 Table of Contents

### HiringBazaar APIs (Existing)
1. [Auth APIs](#1-auth-apis)
2. [Job APIs](#2-job-apis)
3. [Candidate APIs](#3-candidate-apis)
4. [Dashboard APIs](#4-dashboard-apis)
5. [Platform APIs](#5-platform-apis)
6. [Plan APIs](#6-plan-apis)
### Unified Admin APIs
7. [Dashboard & HR Management](#7-admin-dashboard--hr-management)
8. [Partner Management](#8-admin-partner-management)
9. [Job Sharing Management](#9-admin-job-sharing)

### Partner System APIs
10. [Partner Authentication](#10-partner-authentication)
11. [Partner Jobs](#11-partner-jobs)

---

# 🏢 HiringBazaar APIs

## 1. Auth APIs

Base Path: `/api/auth`

---

### 1.1 Register HR

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/auth/register` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "fullName": "HR Name",
  "email": "hr@company.com",
  "phone": "9876543210",
  "password": "password123",
  "companyName": "TechCorp",
  "address": "Mumbai, India"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123...",
    "fullName": "HR Name",
    "email": "hr@company.com",
    "phone": "9876543210",
    "companyName": "TechCorp",
    "address": "Mumbai, India",
    "role": "HR"
  }
}
```

---

### 1.2 Login HR/Admin

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/auth/login` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "email": "hr@company.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123...",
    "fullName": "HR Name",
    "email": "hr@company.com",
    "role": "HR"
  }
}
```

---

### 1.3 Get Current User

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/auth/me` |
| **Auth** | Bearer Token |

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user123...",
    "fullName": "HR Name",
    "email": "hr@company.com",
    "role": "HR",
    "isActive": true
  }
}
```

---

### 1.4 Forgot Password

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/auth/forgot-password` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "email": "hr@company.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token sent to email"
}
```

---

### 1.5 Reset Password

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/auth/reset-password/:token` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### 1.6 Admin Register (Postman Only)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/auth/admin/register` |
| **Auth** | None (Internal Use) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "fullName": "Admin User",
  "email": "admin@hiringbazaar.com",
  "password": "adminpass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin123...",
    "fullName": "Admin User",
    "email": "admin@hiringbazaar.com",
    "role": "ADMIN"
  }
}
```

---

### 1.7 Admin Login

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/auth/admin/login` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "email": "admin@hiringbazaar.com",
  "password": "adminpass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin123...",
    "fullName": "Admin User",
    "email": "admin@hiringbazaar.com",
    "role": "ADMIN"
  }
}
```

---

## 2. Job APIs

Base Path: `/api/jobs`

> **Note:** All routes require HR authentication unless specified

---

### 2.1 Create Job Draft

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/jobs/draft` |
| **Auth** | Bearer Token (HR) |
| **Content-Type** | `application/json` |

**Headers:**
```
Authorization: Bearer <hr_token>
```

**Success Response (201):**
```json
{
  "success": true,
  "job": {
    "_id": "job123...",
    "status": "draft",
    "userId": "user123...",
    "createdAt": "2026-01-24T10:00:00.000Z"
  }
}
```

---

### 2.2 Update Job Step 1 (Basic Info)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/jobs/:id/step1` |
| **Auth** | Bearer Token (HR) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "jobTitle": "Senior React Developer",
  "companyName": "TechCorp",
  "location": "Bangalore",
  "jobType": "Full-time",
  "workMode": "Hybrid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "job123...",
    "jobTitle": "Senior React Developer",
    "completedSteps": 1
  }
}
```

---

### 2.3 Update Job Step 2 (Requirements)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/jobs/:id/step2` |
| **Auth** | Bearer Token (HR) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "experience": "3-5 years",
  "skills": ["React", "TypeScript", "Node.js"],
  "qualification": "B.Tech/B.E"
}
```

---

### 2.4 Update Job Step 3 (Description)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/jobs/:id/step3` |
| **Auth** | Bearer Token (HR) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "description": "We are looking for a Senior React Developer...",
  "responsibilities": ["Build frontend", "Code review"],
  "benefits": ["Health Insurance", "WFH"]
}
```

---

### 2.5 Update Job Step 4 (Salary & Platforms)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/jobs/:id/step4` |
| **Auth** | Bearer Token (HR) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "salary": "15-25 LPA",
  "platforms": ["LinkedIn", "Indeed", "Naukri"]
}
```

---

### 2.6 Post Job (Submit for Approval)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/jobs/:id/post` |
| **Auth** | Bearer Token (HR) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {
    "_id": "job123...",
    "status": "pending",
    "jobTitle": "Senior React Developer"
  }
}
```

---

### 2.7 Get My Jobs

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/jobs` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "jobs": [
    {
      "_id": "job123...",
      "jobTitle": "Senior React Developer",
      "status": "active",
      "candidateCount": 10
    }
  ]
}
```

---

### 2.8 Get Job by ID

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/jobs/:id` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "job123...",
    "jobTitle": "Senior React Developer",
    "companyName": "TechCorp",
    "description": "...",
    "skills": ["React", "TypeScript"]
  }
}
```

---

### 2.9 Delete Job

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/jobs/:id` |
| **Auth** | Bearer Token (HR) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## 3. Candidate APIs

Base Path: `/api/candidates`

---

### 3.1 Add Candidate (Admin)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/candidates` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**
```
jobId: "job123..."
name: "Candidate Name"
email: "candidate@email.com"
phoneNumber: "9876543210"
source: "LinkedIn"
resume: <FILE>
```

**Success Response (201):**
```json
{
  "success": true,
  "candidate": {
    "_id": "candidate123...",
    "name": "Candidate Name",
    "email": "candidate@email.com",
    "parsingStatus": "PENDING",
    "uploadSource": "admin",
    "uploaderId": "user123...",
    "uploaderModel": "User",
    "uploaderDetails": {
      "name": "Admin User",
      "uploaderType": "admin"
    }
  }
}
```

---

### 3.2 Bulk Upload Candidates (Admin)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/candidates/bulk` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**
```
jobId: "job123..."
source: "BULK_UPLOAD"
resumes: <MULTIPLE FILES - up to 100>
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "15 candidates uploaded and queued for parsing",
  "candidates": [
    {
      "_id": "candidate123...",
      "name": "resume_filename",
      "parsingStatus": "PENDING",
      "uploadSource": "admin",
      "uploaderId": "user123...",
      "uploaderModel": "User",
      "uploaderDetails": {
        "name": "Admin User",
        "uploaderType": "admin"
      }
    }
  ]
}
```

---

### 3.3 Get My Candidates (HR)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/candidates/my-candidates` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "count": 25,
  "candidates": [
    {
      "_id": "candidate123...",
      "name": "Candidate Name",
      "atsScore": 85,
      "status": "Pending Review",
      "jobId": {
        "jobTitle": "Senior React Developer"
      }
    }
  ]
}
```

---

### 3.4 Get Candidates by Job

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/candidates/job/:jobId` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "candidates": [...]
}
```

---

### 3.5 Update Candidate Feedback

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/candidates/:id/feedback` |
| **Auth** | Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "feedback": "SHORTLISTED"
}
```

**Valid feedback values:**
- `PENDING`, `INTERVIEW_SCHEDULED`, `HIRED`, `REJECTED`
- `Pending Review`, `Shortlisted by HB`, `Engaged`, `Taken`
- `Shortlisted by HR`, `Interviewed`, `Rejected`, `Hired`, `SHORTLISTED`

**Success Response (200):**
```json
{
  "success": true,
  "candidate": {
    "_id": "candidate123...",
    "status": "SHORTLISTED"
  }
}
```

---

### 3.6 Delete Candidate (Admin)

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/candidates/:id` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## 4. Dashboard APIs

Base Path: `/api/dashboard`

---

### 4.1 Get Dashboard Stats (HR)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/dashboard/stats` |
| **Auth** | Bearer Token (HR) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 10,
    "activeJobs": 5,
    "totalCandidates": 150,
    "shortlisted": 25,
    "interviewed": 10,
    "hired": 5
  }
}
```

---

## 5. Platform APIs

Base Path: `/api/platforms`

---

### 5.1 Get All Platforms

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/platforms` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "platforms": [
    {
      "_id": "platform123...",
      "name": "LinkedIn",
      "currentPrice": 500,
      "unit": "per post",
      "isActive": true
    }
  ]
}
```

---

### 5.2 Get Platform by ID

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/platforms/:id` |
| **Auth** | Bearer Token |

**Success Response (200):**
```json
{
  "success": true,
  "platform": {
    "_id": "platform123...",
    "name": "LinkedIn",
    "currentPrice": 500
  }
}
```

---

## 6. Plan APIs

Base Path: `/api/plans`

---

### 6.1 Get All Plans (Public)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/plans` |
| **Auth** | None |

**Success Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "plan123...",
      "name": "Basic",
      "price": 999,
      "features": ["5 Job Posts", "50 Resumes"]
    }
  ]
}
```

---

### 6.2 Get Plan by ID (Public)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/plans/:id` |
| **Auth** | None |

---

### 6.3 Create Plan (Admin)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/plans` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "name": "Premium",
  "price": 4999,
  "features": ["Unlimited Jobs", "500 Resumes", "Priority Support"]
}
```

---

### 6.4 Update Plan (Admin)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/plans/:id` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

---

## 7. Admin Dashboard & HR Management

Base Path: `/api/admin`

> **Note:** All routes require Admin authentication

---

### 7.1 Get Admin Dashboard Stats

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/stats` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalHRs": 50,
    "totalJobs": 200,
    "totalCandidates": 5000,
    "pendingJobsCount": 15,
    "trends": {
      "hrTrend": 20,
      "jobTrend": 35,
      "candidateTrend": 50
    }
  }
}
```

---

### 7.2 Get All Jobs (Master)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/jobs` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 100,
  "jobs": [
    {
      "_id": "job123...",
      "jobTitle": "Senior React Developer",
      "status": "pending",
      "userId": {
        "fullName": "HR Name",
        "email": "hr@company.com"
      }
    }
  ]
}
```

---

### 7.3 Get All HRs

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/hrs` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 50,
  "hrs": [
    {
      "_id": "hr123...",
      "fullName": "HR Name",
      "email": "hr@company.com",
      "companyName": "TechCorp",
      "isActive": true
    }
  ]
}
```

---

### 7.4 Get HR by ID

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/hrs/:id` |
| **Auth** | Bearer Token (Admin) |

---

### 7.5 Get Jobs by HR

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/hrs/:hrId/jobs` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "jobs": [
    {
      "_id": "job123...",
      "jobTitle": "Senior React Developer",
      "candidateCount": 25
    }
  ]
}
```

---

### 7.6 Update Job Status (Approve/Reject)

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/admin/jobs/:id/status` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "status": "active"
}
```

**Valid values:** `pending`, `active`, `rejected`, `posted`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job status updated to active",
  "job": {...}
}
```

> **Note:** Approval email is automatically sent to HR.

---

### 7.7 Delete Job (Admin)

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/admin/jobs/:id` |
| **Auth** | Bearer Token (Admin) |

---

### 7.8 Update HR

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/admin/hrs/:id` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "isActive": false,
  "fullName": "Updated Name"
}
```

---

### 7.9 Delete HR and All Data

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/admin/hrs/:id` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "HR hr@company.com and all associated jobs/candidates deleted successfully."
}
```

---

### 7.10 Get All Candidates (Master)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/candidates` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 5000,
  "candidates": [...]
}
```

---

### 7.11 Add Candidate (Admin)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/admin/candidates` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `multipart/form-data` |

(Same as `/api/candidates`)

---

### 7.12 Delete Candidate (Admin)

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/admin/candidates/:id` |
| **Auth** | Bearer Token (Admin) |

---

### 7.13 Update Platform

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **URL** | `/api/admin/platforms/:id` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "currentPrice": 750,
  "isActive": true
}
```

---

# 🤝 PartnerHB APIs

## 10. Partner Authentication

Base Path: `/api/partner/auth`

---

### 8.1 Register Partner

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/partner/auth/register` |
| **Auth** | None (Public) |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**
```
partnerName: John Doe
organizationName: ABC Recruiters
email: john@abcrecruiters.com
password: securepass123
phone: 9876543210
resume: <FILE: PDF/DOC/DOCX>
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration submitted successfully. We will review and approve your account shortly.",
  "partner": {
    "id": "partner123...",
    "partnerName": "John Doe",
    "organizationName": "ABC Recruiters",
    "email": "john@abcrecruiters.com",
    "status": "pending"
  }
}
```

---

### 8.2 Login Partner

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/partner/auth/login` |
| **Auth** | None (Public) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "email": "john@abcrecruiters.com",
  "password": "securepass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "partner": {
    "id": "partner123...",
    "partnerName": "John Doe",
    "organizationName": "ABC Recruiters",
    "status": "approved"
  }
}
```

---

### 8.3 Get Partner Profile

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/partner/auth/profile` |
| **Auth** | Bearer Token (Partner) |

**Headers:**
```
Authorization: Bearer <partner_token>
```

---

## 11. Partner Jobs

Base Path: `/api/partner/jobs`

> **Note:** All routes require Partner authentication

---

### 9.1 Get Shared Jobs

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/partner/jobs` |
| **Auth** | Bearer Token (Partner) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "jobs": [
    {
      "_id": "job123...",
      "jobTitle": "Senior React Developer",
      "location": "Bangalore",
      "sharedAt": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### 9.2 Get Job Details

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/partner/jobs/:jobId` |
| **Auth** | Bearer Token (Partner) |

---

### 9.3 Upload Resume for Job

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/partner/jobs/:jobId/upload` |
| **Auth** | Bearer Token (Partner) |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**
```
name: Candidate Name
email: candidate@email.com
phoneNumber: 9876543210
source: LinkedIn
resume: <FILE>
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully and queued for processing",
  "candidate": {
    "id": "candidate123...",
    "uploadSource": "partner",
    "uploaderDetails": {
      "name": "John Doe",
      "organizationName": "ABC Recruiters",
      "uploaderType": "partner"
    }
  }
}
```

---

### 9.4 Get Partner's Uploaded Candidates

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/partner/uploads` |
| **Auth** | Bearer Token (Partner) |

---

## 8. Admin Partner Management

Base Path: `/api/admin/partners`

> **Note:** All routes require Admin authentication

---

### 10.1 Get All Partners

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/partners` |
| **Auth** | Bearer Token (Admin) |

---

### 10.2 Get Pending Partners

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/partners/pending` |
| **Auth** | Bearer Token (Admin) |

---

### 10.3 Get Approved Partners

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/partners/approved` |
| **Auth** | Bearer Token (Admin) |

---

### 10.4 Get Partner by ID

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/partners/:id` |
| **Auth** | Bearer Token (Admin) |

---

### 10.5 Approve Partner

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/admin/partners/:id/approve` |
| **Auth** | Bearer Token (Admin) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Partner approved successfully",
  "partner": {
    "id": "partner123...",
    "partnerName": "John Doe",
    "status": "approved"
  }
}
```

---

### 10.6 Reject Partner

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/admin/partners/:id/reject` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "reason": "Incomplete documentation"
}
```

---

## 9. Admin Job Sharing

Base Path: `/api/admin/job-sharing`

> **Note:** All routes require Admin authentication

---

### 11.1 Get Available Jobs for Sharing

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/job-sharing/available-jobs` |
| **Auth** | Bearer Token (Admin) |

---

### 11.2 Share Job with Partners

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/admin/job-sharing/:jobId/share` |
| **Auth** | Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "partnerIds": ["partner123...", "partner456..."]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job shared with 2 partner(s)",
  "results": [
    { "partnerId": "partner123...", "status": "shared", "mappingId": "mapping789..." }
  ]
}
```

---

### 11.3 Get Partners for a Job

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/api/admin/job-sharing/:jobId/partners` |
| **Auth** | Bearer Token (Admin) |

---

### 11.4 Remove Job Sharing

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/admin/job-sharing/:jobId/partners/:partnerId` |
| **Auth** | Bearer Token (Admin) |

---

## 🔐 Authentication Summary

| User Type | Login Endpoint | Token Usage |
|-----------|---------------|-------------|
| HR | `POST /api/auth/login` | `Authorization: Bearer <token>` |
| Admin | `POST /api/auth/admin/login` | `Authorization: Bearer <token>` |
| Partner | `POST /api/partner/auth/login` | `Authorization: Bearer <token>` |

---

## 📁 File Upload Notes

- **Max file size:** 5MB
- **Allowed formats:** PDF, DOC, DOCX
- **Field name for resume:** `resume` (single) or `resumes` (bulk)

---

## 📊 API Count Summary

| Module | API Count |
|--------|-----------|
| Auth | 7 |
| Jobs | 9 |
| Candidates | 6 |
| Dashboard | 1 |
| Platforms | 2 |
| Plans | 4 |
| Admin (Dashboard & HR) | 13 |
| Admin Partners | 6 |
| Admin Job Sharing | 4 |
| Partner Auth | 3 |
| Partner Jobs | 4 |
| **Total** | **59 APIs** |
