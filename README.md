# 🏫 CampusFix - Smart Campus Issue Reporting & Resolution Platform

**CampusFix** is a modern, responsive, full-stack web application designed for university campuses. It enables college students to report real-world problems (electrical hazards, plumbing leaks, Wi-Fi breakdowns, furniture damages, sanitation issues, etc.) and provides campus administrators and maintenance teams with real-time incident triage, AI-driven categorization, priority routing, and analytics.

---

## 🌟 Key Features

1. **Student Registration & Authentication**:
   - Secure login & registration with role-based access control (`student`, `admin`, `technician`).
   - Salted password hashing with PBKDF2 and HMAC-signed session tokens.
   - **⚡ 1-Click Demo Accounts**: Instant test login for Student, Campus Admin, and Field Technician without typing credentials.

2. **Smart Complaint Submission Form**:
   - Detailed incident intake: Title, description, building zone, room number/floor.
   - **Photo Uploads**: Support for camera and file uploads with live thumbnail preview. Quick demo photo evidence generator included.
   - **Anonymous Reporting**: Students can choose to hide their personal profile from public cards.

3. **✨ AI-Powered Complaint Categorization & Priority Engine**:
   - Multi-factor natural language analysis scans title and description text in real time.
   - Auto-categorizes across 8 university domains:
     - ⚡ *Electrical & Power*
     - 🚰 *Plumbing & Water*
     - 🏗️ *Infrastructure & Furniture*
     - 📶 *IT & Campus Wi-Fi*
     - 🧹 *Cleanliness & Sanitation*
     - 🛡️ *Safety & Security*
     - 🏢 *Hostel & Mess*
     - 📚 *Library & Labs*
   - Suggests Priority (*Urgent*, *High*, *Medium*, *Low*) with safety risk explanation and confidence rating (e.g. 96%).
   - **1-Click "Apply AI Recommendations"** auto-fills the category and priority for the user.

4. **Complaint Status Tracking & Timeline**:
   - Public campus feed with live status badges: `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` / `Rejected`.
   - Visual step-by-step resolution pipeline tracker with actor timestamps.
   - Upvoting system ("I'm experiencing this too") to surface widespread campus bottlenecks.
   - Community activity feed & comment thread on every ticket.

5. **🛡️ Campus Facilities Admin Dashboard**:
   - Real-time KPI summary: Total tickets, Urgent issues, Work In Progress, Resolved count.
   - Interactive management table with search and filtering.
   - **Inline status updating**: Admins and technicians can change ticket statuses on the fly.
   - Maintenance staff assignment & official resolution notes.
   - **CSV Report Export**: Download full campus incident report for university leadership.

6. **📊 Campus Analytics & Incident Hotspots**:
   - Category distribution breakdown charts.
   - Priority & risk severity split.
   - **Top Campus Hotspots ranking**: Identifies which campus buildings have the highest problem density.
   - Resolution efficiency & average SLA turnaround time.

7. **Modern Blue & White University Theme**:
   - Clean, professional design system with deep campus blues (`#1e40af`, `#2563eb`), crisp white cards, and clear status accents.
   - Fully responsive for mobile phones, tablets, and desktop displays.

---

## 📂 Project Architecture

```
CampusFix/
├── bin/
│   └── node.cmd                # Pre-configured Node runner for Windows
├── package.json                # Project dependencies and test scripts
├── start.bat                   # 1-click Windows runner (starts server & opens browser)
├── start.sh                    # Linux / macOS runner
├── server/
│   ├── config.js               # Port, DB path, categories, priorities, SLA configs
│   ├── db.js                   # High-performance SQLite database setup (WAL mode)
│   ├── seed.js                 # Realistic university seed data generator
│   ├── auth.js                 # PBKDF2 password hashing & HMAC token manager
│   ├── ai.js                   # AI Natural Language Categorization & Urgency Engine
│   ├── index.js                # Main HTTP server & static file server
│   └── routes/
│       ├── authRoutes.js       # Register, login, me, demo-accounts
│       ├── aiRoutes.js         # Real-time AI complaint text analysis
│       ├── complaintRoutes.js  # Tickets CRUD, upvotes, comments, photo upload
│       └── analyticsRoutes.js  # Campus overview, category stats, hotspots
├── public/
│   ├── index.html              # Modern single-page application shell
│   ├── css/
│   │   └── style.css           # Blue & white theme, animations, badge styles
│   ├── js/
│   │   ├── api.js              # Frontend REST API client
│   │   ├── app.js              # Main React application controller
│   │   └── components/
│   │       ├── Navbar.js       # Responsive navigation bar & demo switcher
│   │       ├── HeroBanner.js   # Campus hero banner & category quick filters
│   │       ├── FilterBar.js    # Multi-faceted search, status tabs, sorting
│   │       ├── ComplaintForm.js# Report form with live AI suggestions & upload
│   │       ├── ComplaintCard.js# Ticket card with status pills & upvotes
│   │       ├── ComplaintDetailModal.js # Full modal with timeline & admin controls
│   │       ├── AdminDashboard.js# Administrative table & CSV exporter
│   │       ├── AnalyticsView.js# Detailed charts & campus problem hotspots
│   │       ├── AuthModal.js    # Login/register modal with 1-click demo logins
│   │       └── Toast.js        # Global toast alert notifications
│   └── uploads/                # Stored photo evidence files
└── tests/
    └── test_api.js             # Automated test suite (13/13 passing tests)
```

---

## 🚀 How to Run Locally

### Option 1: 1-Click Launch on Windows (Recommended)
Simply double-click:
```bat
start.bat
```
This will automatically launch the server on `http://localhost:3000` and open it in your browser.

---

### Option 2: Using Node or npm (Any OS)
If you have Node.js installed on your terminal:
```bash
# 1. Start the server
npm start
# or:
node server/index.js

# 2. Open in your browser:
# http://localhost:3000
```

---

## 🧪 Running Automated Tests

Run the comprehensive integration test suite verifying Auth, AI Categorization, Complaints CRUD, Upvoting, Status Updating, and Analytics:

```bash
npm test
# or:
node tests/test_api.js
```

All 13 integration tests run and pass out-of-the-box.

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation, the application provides pre-configured university accounts. You can also click the **"⚡ Demo Roles"** button in the top navigation bar to switch roles in 1 click!

| Role | Name | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `student@campusfix.edu` | `Student@123` | Submit issues, track tickets, upvote problems, post comments |
| **Campus Admin** | Prof. Sarah Jenkins | `admin@campusfix.edu` | `Admin@123` | Full Admin Portal, change statuses, assign technicians, export CSV |
| **Technician** | Marcus Vance | `staff@campusfix.edu` | `Staff@123` | Field technician: update assigned tasks, post resolution notes |

---

## 🌐 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create student or staff account
- `POST /api/auth/login` - Authenticate and retrieve token
- `GET /api/auth/me` - Get current user profile (requires Bearer token)
- `GET /api/auth/demo-accounts` - Get pre-configured demo accounts

### AI Categorization
- `POST /api/ai/analyze` - Analyzes complaint title and description, outputs recommended category, priority, risk level, confidence percentage, and suggested campus department.

### Complaints
- `GET /api/complaints` - Query tickets with filters (`status`, `category`, `priority`, `search`, `mine`, `sort`)
- `GET /api/complaints/:id` - Get single ticket details and activity timeline
- `POST /api/complaints` - Create a new complaint ticket
- `PATCH /api/complaints/:id/status` - Update ticket status, technician, and admin notes
- `POST /api/complaints/:id/upvote` - Toggle upvote on a complaint
- `POST /api/complaints/:id/comments` - Append an update or comment to the ticket timeline
- `POST /api/complaints/upload-photo` - Upload image photo evidence

### Analytics
- `GET /api/analytics/overview` - University KPI overview (totals, active, resolved, avg resolution hours)
- `GET /api/analytics/categories` - Incidents breakdown per category
- `GET /api/analytics/priorities` - Priority distribution
- `GET /api/analytics/hotspots` - Top affected campus buildings and zones

---

## 📄 License
MIT License. Created for campus infrastructure improvement.
