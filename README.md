# PARAKH AI — Adaptive Assessment & Institutional Intelligence Platform

PARAKH AI is a full-stack, AI-powered adaptive assessment system engineered for higher education and competitive learning. It replaces static examinations with Computer Adaptive Testing (CAT) based on Item Response Theory (IRT) and Elo rating algorithms. The platform dynamically recalibrates question difficulty based on real-time student performance, enforces integrity via automated client-side proctoring violation tracking, provides instant AI-powered concept tutoring (powered by Groq LLaMA-3.3-70B), and surfaces real-time institutional knowledge gap analytics and student oversight for educators.

---

## Tech Stack

### Backend
- **Runtime & Framework:** Node.js, Express (`^4.19.2`)
- **Database & ODM:** MongoDB, Mongoose (`^8.4.4`)
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken` `^9.0.2`), Password Hashing (`bcryptjs` `^2.4.3`), CORS (`^2.8.5`)
- **AI / LLM Integration:** Groq SDK (`groq-sdk` `^1.5.0`, model `llama-3.3-70b-versatile`)
- **Environment Management:** `dotenv` (`^16.4.5`)

### Frontend
- **Framework & Build Tool:** React 19 (`react` `^19.2.8`), Vite (`^8.2.0`)
- **Routing & State:** React Router DOM (`^7.18.2`), React Context API (`AuthContext`, `ThemeContext`)
- **Styling & UI:** Tailwind CSS (`^4.3.3`), `@tailwindcss/vite` (`^4.3.3`), PostCSS, Lucide React (`^1.31.0`), Framer Motion (`^13.1.0`), `clsx`, `tailwind-merge`
- **Data Visualization:** Recharts (`^3.10.1`)
- **Linter:** Oxlint (`^1.75.0`)

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["React 19 Single Page Application"]
        FE_Auth["AuthContext / ThemeContext"]
        FE_Student["Student Views\n(Dashboard, Assessment, Knowledge,\nLearning Path, AI Tutor)"]
        FE_Admin["Admin Views\n(Overview, Student Roster,\nStudent Detail, Question Bank, AI Generator)"]
        FE_Guard["ProtectedRoute & Layout Guards"]
    end

    subgraph Server["Express Node.js Backend Server"]
        Middleware["Auth Middleware (JWT Verify & Throttled lastActiveAt)"]
        
        R_Auth["Auth Router (/api/auth)"]
        R_Assess["Assessment Router (/api/assessment)"]
        R_Student["Student Router (/api/student)"]
        R_Tutor["Tutor Router (/api/tutor)"]
        R_Admin["Admin Router (/api/admin)"]

        CAT_Engine["Adaptive CAT / IRT Engine\n(Elo Rating & Candidate Scoring)"]
    end

    subgraph DataStore["Persistence & AI Services"]
        MongoDB[("MongoDB Atlas Database\n(Users, Questions, StudentConcepts,\nResponses, AssessmentSessions, MasteryLogs)")]
        GroqAPI["Groq Cloud LLM API\n(LLaMA 3.3 70B Versatile)"]
    end

    FE_Student -->|Bearer JWT Header| Middleware
    FE_Admin -->|Bearer JWT Header| Middleware
    FE_Auth -->|Login / Signup| R_Auth

    Middleware --> R_Auth
    Middleware --> R_Assess
    Middleware --> R_Student
    Middleware --> R_Tutor
    Middleware --> R_Admin

    R_Assess <--> CAT_Engine
    R_Tutor -->|Concept Explanation Prompts| GroqAPI
    R_Admin -->|MCQ Generation Prompts| GroqAPI

    R_Auth <--> MongoDB
    R_Assess <--> MongoDB
    R_Student <--> MongoDB
    R_Admin <--> MongoDB
```

---

## Data Model & Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ StudentConcept : "has mastery records"
    User ||--o{ Response : "submits"
    User ||--o{ AssessmentSession : "conducts"
    User ||--o{ MasteryLog : "tracks progression"
    Question ||--o{ Response : "evaluated in"

    User {
        ObjectId _id PK
        String name
        String email UK
        String passwordHash
        String role "enum: [student, admin]"
        Boolean hasCompletedDiagnostic
        Date lastActiveAt
        Date createdAt
        Date updatedAt
    }

    Question {
        ObjectId _id PK
        String concept "enum: 8 canonical concepts"
        Number difficulty "enum: [1, 2, 3]"
        String text
        StringArray options "length: 4"
        Number correctAnswer "min: 0, max: 3"
        String explanation
        Number exposure
        String source "enum: [seed, AI Generated, Bulk Generator]"
        Number eloRating "default: 1100"
        Number timesCorrect
        Number timesAnswered
        Date createdAt
        Date updatedAt
    }

    StudentConcept {
        ObjectId _id PK
        ObjectId userId FK
        String concept
        Number mastery "range: 0-100"
        Number abilityRating "Elo rating, default: 1100"
        Date createdAt
        Date updatedAt
    }

    Response {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId questionId FK
        String concept
        Number difficulty
        Boolean isCorrect
        Number timeSpent
        String sessionId
        Date createdAt
        Date updatedAt
    }

    AssessmentSession {
        ObjectId _id PK
        ObjectId userId FK
        String sessionId UK
        Date startedAt
        Date completedAt
        String status "enum: [in_progress, completed, terminated]"
        String mode "enum: [diagnostic, targeted, adaptive]"
        String concept
        Number violationCount
        Array violations "objects: { type, timestamp }"
        String terminationReason
        Date createdAt
        Date updatedAt
    }

    MasteryLog {
        ObjectId _id PK
        ObjectId userId FK
        String concept
        Number mastery
        Number abilityRating
        Number delta
        Date timestamp
        Date createdAt
        Date updatedAt
    }
```

---

## Repository Structure

```
SIH2026_INTERNAL/
├── backend/                       # Express Node.js Backend API Service
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Atlas connection setup & auto-seeder
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification & throttled lastActiveAt middleware
│   │   ├── models/                # Mongoose database schemas
│   │   │   ├── AssessmentSession.js
│   │   │   ├── MasteryLog.js
│   │   │   ├── Question.js
│   │   │   ├── Response.js
│   │   │   ├── StudentConcept.js
│   │   │   └── User.js
│   │   ├── routes/                # Express API router controllers
│   │   │   ├── admin.js
│   │   │   ├── assessment.js
│   │   │   ├── auth.js
│   │   │   ├── student.js
│   │   │   └── tutor.js
│   │   ├── scripts/               # Maintenance, migration, and verification scripts
│   │   │   ├── bulkGenerateQuestions.js
│   │   │   ├── cleanupTestAccounts.js
│   │   │   ├── countQuestions.js
│   │   │   ├── migrateAbilityRatings.js
│   │   │   ├── migrateDiagnosticFlag.js
│   │   │   ├── migrateQuestionElo.js
│   │   │   ├── rehearseDemo.js
│   │   │   ├── seedAdminAndStudents.js
│   │   │   ├── seedAllDemoData.js
│   │   │   ├── seedQuestions.js
│   │   │   ├── verifyPhase12And13.js
│   │   │   ├── verifyPhase14.js
│   │   │   ├── verifyPhase15.js
│   │   │   └── warmupLLM.js
│   │   └── index.js               # Express application entry point & CORS configuration
│   ├── .env.example               # Template environment configuration file
│   └── package.json               # Backend dependencies & script definitions
├── frontend/                      # React 19 + Vite Frontend SPA Service
│   ├── public/                    # Static brand assets (favicon.svg, logo.svg)
│   ├── src/
│   │   ├── components/            # Reusable UI components & layouts
│   │   │   ├── Layout.jsx         # Dynamic role-separated navigation shell
│   │   │   └── ProtectedRoute.jsx # Role-aware route guard & active assessment lock
│   │   ├── context/               # Global state contexts
│   │   │   ├── AuthContext.jsx    # User authentication & token state provider
│   │   │   └── ThemeContext.jsx   # Dark/light theme state provider
│   │   ├── pages/                 # Route page components
│   │   │   ├── Admin.jsx          # Institutional Overview KPI Dashboard
│   │   │   ├── AiGenerator.jsx    # AI Question Generator & Groq LLaMA validator
│   │   │   ├── AiTutor.jsx        # Conversational AI Tutor interface
│   │   │   ├── Assessment.jsx     # Active CAT assessment player & proctoring listener
│   │   │   ├── Dashboard.jsx      # Student dashboard & readiness metrics
│   │   │   ├── Knowledge.jsx      # Interactive student Knowledge Profile & concept breakdown
│   │   │   ├── Landing.jsx        # Product landing page
│   │   │   ├── LearningPath.jsx   # Targeted study plan & adaptive recommendations
│   │   │   ├── Login.jsx          # Auth login page
│   │   │   ├── QuestionBankHealth.jsx # Admin Question Bank inventory & health matrix
│   │   │   ├── Results.jsx        # Test completion summary & score report
│   │   │   ├── Signup.jsx         # Auth signup page
│   │   │   ├── StudentDetail.jsx  # Admin student drill-down view & violation stream
│   │   │   └── StudentRoster.jsx  # Admin student roster table with search/sort
│   │   ├── App.jsx                # Application routes & layout bindings
│   │   ├── index.css              # Custom styling system, design tokens, & keyframes
│   │   └── main.jsx               # React DOM entry point
│   ├── package.json               # Frontend dependencies & build script definitions
│   └── vite.config.js             # Vite bundler configuration
├── render.yaml                    # Render Infrastructure-as-Code Blueprint specification
└── README.md                      # Comprehensive system documentation
```

---

## Core Workflows

### 1. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student / Admin
    participant FE as React Frontend (AuthContext)
    participant BE as Express Backend (/api/auth)
    participant DB as MongoDB Atlas

    User->>FE: Enter Credentials (Email & Password)
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: User.findOne({ email })
    DB-->>BE: User Document (including passwordHash & role)
    BE->>BE: bcrypt.compare(password, user.passwordHash)
    BE->>BE: jwt.sign({ id, name, email, role }, JWT_SECRET)
    BE-->>FE: HTTP 200 OK { token, user: { id, name, email, role } }
    FE->>FE: Store Token & User in AuthContext / localStorage
    FE->>FE: Check user.role: Redirect admin -> /admin, student -> /dashboard
    Note over FE,BE: Subsequent Requests attach Header: Authorization: Bearer <token>
```

---

### 2. Student Assessment & CAT Adaptive Loop

```mermaid
flowchart TD
    Start["Student Clicks Assessment CTA\n(Diagnostic / Targeted / Adaptive)"] --> CheckSession["GET /api/assessment/current"]
    
    CheckSession -->|Session Exists| Resume["Resume Active Assessment Session"]
    CheckSession -->|No Session| StartNew["POST /api/assessment/start { mode, concept }"]
    
    StartNew --> Loop["GET /api/assessment/next"]
    Resume --> Loop

    subgraph Engine["Computer Adaptive Testing (CAT) Engine"]
        Loop --> FilterAnswered["Filter Out Questions Answered in Current Session"]
        FilterAnswered --> FetchCandidates["Fetch Pool Questions matching Concept/Mode"]
        FetchCandidates --> ScoreCandidates["Calculate IRT Candidate Distance:\nscore = |Question.eloRating - StudentConcept.abilityRating|"]
        ScoreCandidates --> SelectQuestion["Select Best Candidate Question (Min Score Distance)"]
    end

    SelectQuestion --> RenderQ["Render Question to Student"]
    RenderQ --> SubmitAns["Student Submits Answer:\nPOST /api/assessment/answer"]

    subgraph UpdateLogic["Elo Rating & Mastery Recalibration"]
        SubmitAns --> CalcExpected["Calculate Expected Score:\nE = 1 / (1 + 10^((Q_Elo - S_Ability) / 400))"]
        CalcExpected --> UpdateAbility["Update Student Ability Rating:\nAbility_new = Ability_old + K * (Actual - E)"]
        UpdateAbility --> UpdateMastery["Scale Ability Rating to Mastery (0-100%)"]
        UpdateMastery --> LogState["Save Response & Create MasteryLog Document"]
    end

    LogState --> CheckEnd{"Session End Condition Met?\n(Question Limit or Mastery Target)"}
    CheckEnd -->|No| Loop
    CheckEnd -->|Yes| Complete["Mark Session Status: 'completed'\nRedirect to /assessment/results"]
```

---

### 3. Proctoring & Violation State Machine

```mermaid
stateDiagram-v2
    [*] --> InProgress: Session Started (status: 'in_progress')

    state InProgress {
        [*] --> Monitoring
        Monitoring --> TabSwitch: Browser Visibility Change (Hidden)
        Monitoring --> FullscreenExit: Fullscreen Exit Event
        Monitoring --> WindowBlur: Window Blur Event
        Monitoring --> NavAttempt: Browser Back/Forward Navigation

        TabSwitch --> LogViolation: POST /api/assessment/violation
        FullscreenExit --> LogViolation: POST /api/assessment/violation
        WindowBlur --> LogViolation: POST /api/assessment/violation
        NavAttempt --> LogViolation: POST /api/assessment/violation

        LogViolation --> WarningState: violationCount < 3
        WarningState --> Monitoring: Display Warning Modal / Toast Banner
    }

    InProgress --> Terminated: violationCount >= 3 OR Severe Exit
    InProgress --> Completed: Test Submitted Normally

    Terminated --> [*]: Session Locked (status: 'terminated')
    Completed --> [*]: Session Finished (status: 'completed')
```

---

### 4. Admin Workflow

```mermaid
flowchart TD
    AdminLogin["Admin Authenticated"] --> Overview["Admin Overview (/admin)\n- Institutional KPIs\n- Knowledge Gap Rankings"]

    Overview --> Roster["Student Roster (/admin/students)\n- Search by Name/Email\n- Sort by Last Active / Mastery / Violations"]
    Overview --> Health["Question Bank Health (/admin/questions)\n- Inventory by Concept & Difficulty\n- Exposure Range & Never Served Count"]
    Overview --> Generator["AI Question Generator (/admin/generator)\n- Groq LLaMA Generation & Validation\n- Duplicate Check against Bank"]

    Roster --> Detail["Student Detail View (/admin/students/:id)\n- Identity Profile & Overall Mastery\n- Accordion Concept Mastery Breakdown\n- Assessment Session History\n- Proctoring Violation Activity Stream"]
```

---

## API Reference

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Registers a new student account and seeds initial concept records. |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and returns a JWT token. |
| `GET` | `/api/auth/me` | Protected | Returns current authenticated user profile payload. |
| `POST` | `/api/auth/seed-demo` | Public | Utility endpoint to seed standard admin and student demo accounts. |

### Assessment Endpoints (`/api/assessment`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assessment/current` | Protected | Checks if user has an active, in-progress assessment session. |
| `POST` | `/api/assessment/start` | Protected | Initializes a new assessment session (`diagnostic`, `targeted`, `adaptive`). |
| `POST` | `/api/assessment/violation` | Protected | Logs a proctoring violation event and checks termination thresholds. |
| `POST` | `/api/assessment/quit` | Protected | Allows student to manually terminate their active test session. |
| `GET` | `/api/assessment/next` | Protected | Retrieves the next adaptive candidate question using CAT/IRT logic. |
| `POST` | `/api/assessment/answer` | Protected | Evaluates question response, updates Elo ratings & mastery, and logs response. |

### Student Endpoints (`/api/student`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/state` | Protected | Returns user's concept mastery values, accuracy, response time, and trend history. |

### AI Tutor Endpoints (`/api/tutor`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tutor/ask` | Protected | Submits concept query to Groq LLaMA-3.3-70B with context-aware student data. |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin Only | Returns institutional KPI metrics (students, assessments, mastery, bank size, violations). |
| `GET` | `/api/admin/gaps` | Admin Only | Aggregates knowledge gap rankings sorted weakest concept first. |
| `GET` | `/api/admin/students` | Admin Only | Returns searchable, sortable list of students with proctoring violation flags. |
| `GET` | `/api/admin/students/:id` | Admin Only | Returns detailed profile, concept breakdown, test history, and violation log for a student. |
| `GET` | `/api/admin/questions/health` | Admin Only | Returns question bank inventory counts, difficulty splits, and exposure metrics. |
| `POST` | `/api/admin/generate-question` | Admin Only | Generates and validates a new MCQ using Groq LLaMA, verifying duplicate uniqueness. |

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB instance (Local or MongoDB Atlas)
- Groq Cloud API Key (for AI Tutor & Question Generator)

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
LLM_API_KEY=your_groq_api_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 2. Dependency Installation

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 3. Database Seeding Sequence

Populate the database with canonical questions and initial demo accounts:

```bash
cd ../backend

# Seed canonical 800+ question bank
npm run seed:questions

# Seed default Admin and Student accounts
npm run seed:admin
```

*(Optional) Seed complete demo datasets and bulk generated items:*
```bash
npm run seed:all
```

### 4. Running Development Servers

Start the Backend API server:
```bash
cd backend
npm run dev
```

In a separate terminal, start the Frontend development server:
```bash
cd frontend
npm run dev
```

Access the application in your browser at `http://localhost:5173`.

---

## Feature & Phase History

- **Phase 0–1:** Base system setup, Express architecture, MongoDB schemas (`User`, `Question`, `Response`, `StudentConcept`, `AssessmentSession`).
- **Phase 2–3:** Authentication system (JWT, `bcryptjs`), login/signup UI, protected routes, initial dashboard layout.
- **Phase 4–5:** Diagnostic test mode, score calculation, concept mastery initialization, initial results view.
- **Phase 6–7:** Admin foundation, knowledge gap overview, Groq LLaMA integration for AI question generation & duplicate check.
- **Phase 8:** Conversational AI Tutor (`/api/tutor/ask`) with concept-aware context prompting.
- **Phase 9:** Client-side proctoring engine (`tab_switch`, `fullscreen_exit`, `window_blur`, `navigation_attempt`) with automated termination guards.
- **Phase 10:** Targeted learning path page, weak concept recommendations, and personalized study cards.
- **Phase 11:** Interactive Knowledge Profile page with concept masteries, accuracy stats, average response times, and historical progress sparklines.
- **Phase 12:** Item Response Theory (IRT) Elo rating engine migration for questions (`eloRating`) and students (`abilityRating`).
- **Phase 13:** Bulk AI Question Bank expansion across all 8 canonical data structure concepts.
- **Phase 14:** Full Computer Adaptive Testing (CAT) dynamic item selection engine based on candidate information scoring.
- **Phase 15:** Institutional Admin Experience — strict role-based routing separation, Overview KPI Dashboard, searchable/sortable Student Roster, Student Detail View with proctoring violation logs, and Question Bank Health matrix.
