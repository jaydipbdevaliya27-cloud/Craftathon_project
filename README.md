# Craftathon_project
# 🛡️ DefenceTrack
### Defence Equipment Accountability & Asset Tracking System

> A secure, real-time digital asset accountability system for defence environments — built with blockchain-backed audit logs, role-based access control, and AI-powered predictive maintenance.

---

## 📌 Problem Statement

Defence operations involve frequent movement of sensitive equipment across personnel, locations, and missions. Existing systems rely on **manual logs or fragmented digital tools** that lack real-time updates and auditability — resulting in unclear responsibility, delayed loss detection, and inefficient maintenance cycles.

**DefenceTrack** solves this with a defence-grade digital system that tracks equipment allocation, usage, movement, and maintenance while enforcing strict access control and audit compliance.

---

## 🚀 Live Demo Credentials

| Role | Badge Number | Password |
|------|-------------|----------|
| 🔴 Admin | `ADMIN001` | `Demo@1234` |
| 🟡 Officer | `OFF001` | `Demo@1234` |
| 🟢 Soldier | `SLD001` | `Demo@1234` |

---

## ✨ Core Features

### 🔐 Role-Based Access Control
- **Soldier** — Request equipment checkout only
- **Officer** — Approve/reject requests, view all unit transactions, schedule maintenance
- **Admin** — Full system control, user management, complete audit access

### ⛓️ Blockchain Audit Log
- Every action (checkout, checkin, maintenance, registration) creates a **cryptographic block**
- Each block stores a **SHA-256 hash** of its contents + the previous block's hash
- Any tampering breaks the chain and is **immediately detected** on the audit screen
- Genesis block initialised on first run — chain grows with every system event

### 📦 Asset Management
- Assets identified by **engraved serial number** (no QR codes — mirrors real defence practice)
- Full asset lifecycle: Register → Deploy → Return → Maintain → Retire
- Asset types: Firearm, Vehicle, Communication, Ammunition, Equipment, Medical
- Condition tracking: Excellent / Good / Fair / Poor

### 🔄 Checkout / Check-in Workflow
- Soldier submits request with serial number + mission code
- Officer/Admin approves or rejects with full reason trail
- Officers and Admins can self-approve (auto-approved flow)
- Real-time asset status: Available / Deployed / Maintenance / Lost

### 🔧 Maintenance Scheduling
- Officers schedule routine, repair, or inspection maintenance
- Asset automatically locked to Maintenance status during service
- Completion marked by officer — asset returned to Available
- Full maintenance history per asset

### 📊 Analytics Dashboard
- Live stat cards: Total, Available, Deployed, Maintenance, Lost
- Pending approvals alert banner for officers/admins
- Poor condition asset alerts
- Recent transaction feed
- Live blockchain activity timeline

### 🤖 AI Features
- **Predictive Maintenance** — Regression model forecasts service needs from usage + condition data
- **Anomaly Detection** — Isolation Forest flags suspicious checkout patterns
- **NL Report Generation** — Claude API converts transaction data into readable mission reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Templating | EJS |
| Styling | Plain CSS (Light theme, white + orange) |
| Auth | express-session + connect-mongo + bcryptjs |
| Blockchain | Node.js built-in `crypto` (SHA-256) |
| AI/ML | Python scikit-learn (REST API) + Claude API |
| Flash Messages | connect-flash |
| Form Methods | method-override |

---

## 📁 Project Structure

```
defencetrack/
├── config/
│   └── db.js                  # MongoDB connection
├── middleware/
│   ├── auth.js                # isAuthenticated guard
│   └── roles.js               # isAdmin, isOfficerOrAdmin, canApprove
├── models/
│   ├── User.js                # Badge no., role, bcrypt password
│   ├── Asset.js               # Serial number, status, condition
│   ├── Block.js               # Blockchain block with SHA-256 chaining
│   ├── Transaction.js         # Checkout/checkin with approval workflow
│   └── Maintenance.js         # Maintenance scheduling and history
├── routes/
│   ├── auth.js                # Login, register, logout
│   ├── assets.js              # Asset CRUD
│   ├── transactions.js        # Checkout, checkin, approve, reject
│   ├── audit.js               # Blockchain viewer + chain verify
│   ├── maintenance.js         # Schedule and complete maintenance
│   └── dashboard.js           # Stats and feed
├── views/
│   ├── partials/              # header, sidebar, footer
│   ├── auth/                  # login, register
│   ├── dashboard/             # index
│   ├── assets/                # index, detail, add
│   ├── transactions/          # index
│   ├── audit/                 # index (blockchain viewer)
│   ├── maintenance/           # index
│   └── error.ejs
├── public/
│   ├── css/style.css          # Full light theme CSS
│   └── js/main.js             # Hamburger, flash dismiss, helpers
├── seed/
│   └── seed.js                # Demo data seeder
├── .env
├── app.js                     # Express app entry point
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourteam/defencetrack.git
cd defencetrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file in the root:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/defencetrack
SESSION_SECRET=defencetrack_secret_2024
```

### 4. Seed demo data
```bash
npm run seed
```

### 5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

### 6. Open in browser
```
http://localhost:3000
```

---

## 🔗 Blockchain Implementation

Each action in DefenceTrack creates an immutable block:

```
Block N:
{
  blockIndex:    5,
  action:        "CHECKOUT",
  performedBy:   <userId>,
  asset:         <assetId>,
  data:          { location, missionCode, toUser },
  timestamp:     2024-03-18T10:30:00Z,
  previousHash:  "a3f9c2...",
  currentHash:   SHA-256(blockIndex + action + performedBy + asset + data + timestamp + previousHash)
}
```

**Tamper detection:** `Blockchain.verifyChain()` recomputes every hash and compares with stored values. Any mismatch = block flagged as ⚠️ TAMPERED.

---

## 👥 Role Permission Matrix

| Action | Soldier | Officer | Admin |
|--------|---------|---------|-------|
| View dashboard | ✅ | ✅ | ✅ |
| Request checkout | ✅ | ✅ | ✅ |
| Approve / Reject | ❌ | ✅ | ✅ |
| Register asset | ❌ | ✅ | ✅ |
| Schedule maintenance | ❌ | ✅ | ✅ |
| View audit log | ❌ | ✅ | ✅ |
| View all transactions | ❌ | ✅ | ✅ |
| Mark asset Lost | ❌ | ✅ | ✅ |
| Full system control | ❌ | ❌ | ✅ |

---

## 🤝 Team

| Member | Module |
|--------|--------|
| Member 1 | Backend — Auth, Assets, Blockchain |
| Member 2 | Backend — Transactions, Maintenance, AI |
| Member 3 | Frontend — All EJS views, CSS |
| Member 4 | Seed data, Testing, Documentation |

---

## 📸 Screenshots

> Add screenshots of Dashboard, Audit Log, Asset Detail, and Transaction pages here.

---

## 🏆 Hackathon

**Theme:** DefenceTech
**Event:** [Your Hackathon Name]
**Track:** Defence Asset Management
**Team:** [Your Team Name]

---

## 📄 License

This project was built for hackathon purposes. All rights reserved by the team.

---

<p align="center">Built with dedication for the defence of the nation 🇮🇳</p>
