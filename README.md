# CWI Backend API

Node.js + Express backend with MongoDB and AI-powered waste analysis.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm start

# Development mode (auto-reload)
npm run dev
```

## 📡 API Endpoints

### Authentication
All endpoints (except `/health` and `/`) require Firebase authentication.

Include token in header:
```
Authorization: Bearer <firebase-id-token>
```

### Waste Endpoints

#### POST /api/waste
Log new waste entry with AI analysis.

**Request Body:**
```json
{
  "department": "Surgery",
  "wasteType": "Sharps",
  "quantity": 5.5,
  "procedureCategory": "Major Surgery",
  "disposalMethod": "Incineration",
  "shift": "Morning",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "department": "Surgery",
    "wasteType": "Sharps",
    "quantity": 5.5,
    "aiAnalysis": {
      "riskScore": 65,
      "anomalyDetected": false,
      "assessment": "AI assessment text...",
      "recommendedAction": "Actions to take...",
      "alertMessage": null
    },
    "timestamp": "2024-02-05T10:30:00.000Z"
  }
}
```

#### GET /api/waste
Get all waste entries for organization.

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `department`: Department name
- `limit`: Number of results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 25
}
```

#### GET /api/waste/stats
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWasteToday": 125.5,
    "percentChange": 12.5,
    "activeAlerts": 3,
    "wasteComposition": [...],
    "sevenDayTrend": [...],
    "departmentPerformance": [...]
  }
}
```

#### GET /api/waste/alerts
Get active alerts.

**Query Parameters:**
- `status`: "active" | "acknowledged" | "resolved" | "all"

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

#### DELETE /api/waste/reset
Reset all waste data for organization.

**Response:**
```json
{
  "success": true,
  "message": "Deleted 50 waste entries",
  "deletedCount": 50
}
```

### Baseline Endpoints

#### POST /api/baselines
Create or update department baseline.

**Request Body:**
```json
{
  "department": "Surgery",
  "expectedDaily": 120,
  "riskThreshold": 70,
  "infectiousRatio": 30,
  "sharpsRatio": 15,
  "costPerKg": 3.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Baseline saved successfully"
}
```

#### GET /api/baselines
Get all baselines for organization.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

#### DELETE /api/baselines/:department
Delete a department baseline.

**Response:**
```json
{
  "success": true,
  "message": "Baseline deleted successfully"
}
```

## 🤖 AI Analysis

The AI analysis service evaluates waste entries based on:

1. **Quantity Analysis** (40 points)
   - Compares against department baseline
   - Flags excessive waste generation

2. **Waste Type Risk** (30 points)
   - Infectious: 30 points
   - Radioactive: 28 points
   - Chemical: 25 points
   - Sharps: 25 points
   - Pharmaceutical: 20 points
   - General: 5 points
   - Recyclable: 0 points

3. **Disposal Method** (20 points)
   - Checks appropriate disposal for waste type
   - Flags improper disposal methods

4. **Procedure-Specific Risk** (10 points)
   - Higher risk for major surgeries
   - Extra caution for pediatric departments

### Risk Score Interpretation
- 0-49: Low Risk (Green)
- 50-69: Medium Risk (Orange)
- 70-100: High Risk (Red)

### OpenAI Integration
- Uses GPT-3.5-turbo for detailed analysis
- Generates assessment and recommendations
- Falls back to rule-based analysis if API fails

## 🗄️ Database Schema

### Collections

**wasteentries**
```javascript
{
  userId: String,
  organizationId: String,
  department: String (enum),
  wasteType: String (enum),
  quantity: Number,
  procedureCategory: String (enum),
  disposalMethod: String (enum),
  shift: String (enum),
  notes: String,
  aiAnalysis: {
    riskScore: Number (0-100),
    anomalyDetected: Boolean,
    assessment: String,
    recommendedAction: String,
    alertMessage: String
  },
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**baselines**
```javascript
{
  organizationId: String,
  department: String (unique per org),
  expectedDaily: Number,
  riskThreshold: Number (0-100),
  infectiousRatio: Number (0-100),
  sharpsRatio: Number (0-100),
  costPerKg: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security

- Firebase Admin SDK for authentication
- JWT token verification on all protected routes
- CORS configuration
- Input validation
- MongoDB injection prevention

## 🐛 Error Handling

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 📝 Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/clinical-waste-intelligence
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Optional
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"

# Test health endpoint
curl http://localhost:5000/health

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/waste/stats
```

## 📊 Performance

- Database queries optimized with indexes
- Aggregation pipelines for statistics
- Efficient date-based filtering
- Connection pooling enabled

## 🔄 Development

```bash
# Install nodemon globally
npm install -g nodemon

# Run in development mode
npm run dev

# The server will auto-reload on file changes
```

## 📖 Additional Documentation

- [Main README](../README.md)
- [Setup Guide](../SETUP_GUIDE.md)
- [Deployment Guide](../DEPLOYMENT.md)
