# 🔧 Clinical Waste Intelligence - Backend API

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> AI-Powered Clinical Waste Management System - Backend API

**Live API:** [https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app/](https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app/)

---

## 🎯 Overview

This is the **backend REST API** for the Clinical Waste Intelligence platform. It provides:

- 🤖 **Real AI Analysis** using OpenAI GPT-4
- 🔐 **JWT Authentication** with Firebase support
- 📊 **MongoDB Database** for data persistence
- 🚨 **Alert Management** system
- 📈 **Analytics Engine** for waste tracking

**Frontend Repository:** [https://github.com/Jainesh24/cwi-project](https://github.com/Jainesh24/cwi-project)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- OpenAI API key
- Firebase project (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/Jainesh24/cwi-backend.git
cd cwi-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm run dev
```

Server runs on `http://localhost:5000`

---

## 🔧 Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cwi_production?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Firebase (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"

# CORS
CORS_ORIGIN=https://cwi-project-xumz.vercel.app
FRONTEND_URL=https://cwi-project-xumz.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📚 API Documentation

### Base URL

```
Production: https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app
Development: http://localhost:5000
```

---

### 🔐 Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "organization": "City Hospital"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 📊 Waste Management

#### Create Waste Entry (with AI Analysis)
```http
POST /api/waste
Authorization: Bearer <token>
Content-Type: application/json

{
  "department": "Emergency",
  "wasteType": "Infectious",
  "quantity": 120,
  "procedureCategory": "Emergency Response",
  "disposalMethod": "Incineration",
  "shift": "Morning"
}
```

**Response (includes AI analysis):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "department": "Emergency",
    "quantity": 120,
    "aiAnalysis": {
      "riskScore": 68,
      "riskLevel": "Medium",
      "riskColor": "yellow",
      "estimatedCost": 384.00,
      "deviation": "+60.0%",
      "complianceStatus": "Review Required",
      "insights": [
        {
          "type": "warning",
          "message": "Quantity exceeds expected by 60%"
        }
      ],
      "recommendations": [
        "Investigate elevated waste levels",
        "Review staff procedures"
      ]
    }
  }
}
```

#### Get All Entries
```http
GET /api/waste
Authorization: Bearer <token>

# Optional filters:
?department=Emergency
?startDate=2024-01-01
?endDate=2024-12-31
```

#### Get Single Entry
```http
GET /api/waste/:id
Authorization: Bearer <token>
```

#### Update Entry
```http
PUT /api/waste/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 150
}
```

#### Delete Entry
```http
DELETE /api/waste/:id
Authorization: Bearer <token>
```

#### Get Analytics
```http
GET /api/waste/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEntries": 250,
    "totalWaste": 5430.5,
    "avgRiskScore": 52,
    "weekOverWeek": "+8.5%",
    "topWasteType": "Infectious",
    "highestRiskDept": "Emergency"
  }
}
```

---

### 🚨 Alert Management

#### Get All Alerts
```http
GET /api/alerts
Authorization: Bearer <token>

# Optional filters:
?status=active
?department=Emergency
```

#### Acknowledge Alert
```http
PUT /api/alerts/:id/acknowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Investigating the issue"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "acknowledged",
    "statusNotes": "Investigating the issue",
    "statusUpdatedAt": "2024-02-06T10:30:00.000Z"
  }
}
```

#### Resolve Alert
```http
PUT /api/alerts/:id/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Issue fixed. Added sharps containers."
}
```

---

### 🤖 AI Services

#### Chat with AI Assistant
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What does a risk score of 68 mean?"
    }
  ],
  "context": {
    "page": "dashboard"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "A risk score of 68 indicates Medium risk level..."
}
```

#### Analyze Waste Data
```http
POST /api/ai/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "department": "Emergency",
  "wasteType": "Infectious",
  "quantity": 100
}
```

#### Get Dashboard Insights
```http
GET /api/ai/insights
Authorization: Bearer <token>
```

---

### ❤️ Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "uptime": 12345.67,
  "timestamp": "2024-02-06T10:30:00.000Z"
}
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  organization: String,
  role: String, // "admin" | "manager" | "user"
  authMethod: String, // "email" | "google" | "phone"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### WasteEntry Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  department: String,
  wasteType: String,
  quantity: Number,
  procedureCategory: String,
  disposalMethod: String,
  shift: String,
  notes: String,
  aiAnalysis: {
    riskScore: Number,
    riskLevel: String,
    riskColor: String,
    estimatedCost: Number,
    deviation: String,
    complianceStatus: String,
    insights: [{type: String, message: String}],
    recommendations: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Alert Collection
```javascript
{
  _id: ObjectId,
  department: String,
  type: String, // "excess" | "shortage" | "compliance"
  message: String,
  severity: String, // "low" | "medium" | "high"
  status: String, // "active" | "acknowledged" | "resolved"
  statusNotes: String,
  updatedBy: ObjectId (ref: User),
  statusUpdatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤖 AI Integration Details

### OpenAI GPT-4

The backend uses OpenAI's GPT-4 Turbo for:

1. **Waste Analysis** - Analyzes entries and generates insights
2. **Risk Assessment** - Calculates risk scores with AI enhancement
3. **Recommendations** - Provides actionable advice
4. **Chat Assistant** - Answers user questions

### AI Service Flow

```
Waste Entry Data
    ↓
Calculate Base Metrics (quantity, type, procedure)
    ↓
Build AI Prompt with Context
    ↓
Send to OpenAI GPT-4
    ↓
Parse AI Response (JSON)
    ↓
Merge with Base Metrics
    ↓
Return Enhanced Analysis
```

### Example AI Prompt

```
You are a clinical waste management AI assistant.

Analyze this waste entry:
- Department: Emergency
- Waste Type: Infectious  
- Quantity: 120 kg
- Expected: 75 kg
- Deviation: +60%

Provide insights and recommendations in JSON format.
```

---

## 📁 Project Structure

```
cwi-backend/
├── config/
│   ├── database.js         # MongoDB connection
│   ├── firebase.js         # Firebase Admin
│   └── openai.js           # OpenAI client
├── models/
│   ├── User.js
│   ├── WasteEntry.js
│   ├── Alert.js
│   └── DepartmentBaseline.js
├── routes/
│   ├── auth.js
│   ├── waste.js
│   ├── alerts.js
│   └── ai.js
├── controllers/
│   ├── authController.js
│   ├── wasteController.js
│   ├── alertController.js
│   └── aiController.js
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── validation.js       # Input validation
│   └── errorHandler.js
├── services/
│   ├── aiService.js        # OpenAI integration
│   └── firebaseService.js
├── utils/
│   └── helpers.js
├── .env
├── server.js               # Entry point
├── vercel.json             # Vercel config
└── package.json
```

---

## 🚀 Deployment (Vercel)

### Automatic Deployment

Connected to GitHub for auto-deployment on push.

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configure Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env`
3. Redeploy

### Vercel Configuration

`vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## 🔒 Security

### Implemented
- ✅ Helmet security headers
- ✅ CORS (specific origins only)
- ✅ Rate limiting (100 requests/15min)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Input validation
- ✅ MongoDB injection prevention

### Best Practices
- Environment variables for secrets
- HTTPS enforced in production
- Token expiration (7 days)
- Error messages sanitized

---

## 🧪 Testing

### Manual Testing

```bash
# Register
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# Login and get token
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Create waste entry
curl -X POST https://your-backend.vercel.app/api/waste \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"department":"Emergency","wasteType":"Infectious","quantity":100,"procedureCategory":"Emergency Response"}'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database?options

# Verify IP whitelist in Atlas
# Add 0.0.0.0/0 for Vercel deployments
```

### OpenAI API Errors

```bash
# Check API key is valid
# Verify billing is set up
# Check rate limits
```

### CORS Errors

```bash
# Update CORS_ORIGIN in .env to match frontend URL
# Ensure it includes https://
```

---

## 📈 Performance

- MongoDB indexed queries
- Connection pooling
- Response compression
- Efficient AI prompt design
- Rate limiting to prevent abuse

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

## 📝 License

MIT License - see LICENSE file

---

## 🔗 Related Links

- **Frontend Repository:** [https://github.com/Jainesh24/cwi-project](https://github.com/Jainesh24/cwi-project)
- **Live Application:** [https://cwi-project-xumz.vercel.app/](https://cwi-project-xumz.vercel.app/)

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues

---

**Built with ❤️ for healthcare sustainability**

**Live API:** [https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app/](https://cwi-backend-f2rxs6fbx-jainesh24s-projects.vercel.app/)
