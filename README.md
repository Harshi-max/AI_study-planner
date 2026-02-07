# AI Study Planner for Engineering Students

**Powered by Camel AI** - A personalized, adaptive study plan generator that creates intelligent 7-day schedules with micro-tasks, progress tracking, and gamification.

---
[Demo Link](https://drive.google.com/file/d/1E-1dUo7jvAgyaujoUwURBoBqBFKyPOPQ/view?usp=sharing)


## 🎯 Mission

An AI-powered study planner that:
- ✅ Analyzes subjects, deadlines, prerequisites, and cognitive load
- ✅ Creates personalized, adaptive study schedules
- ✅ Helps students balance deep learning with timely completion
- ✅ Evolves dynamically as priorities, performance, and difficulty change

## ✨ Features

### Core Features
- **📚 7-Day Adaptive Schedule**: Intelligent weekly planning with micro-tasks
- **🎨 Color-Coded Cognitive Load**: Red (high), Yellow (medium), Green (low)
- **📋 Block Types**: Learning, Practice, Revision, and Buffer time
- **🤖 Camel AI Integration**: Smart adaptive algorithm (no external API required)
- **🔄 Drag-and-Drop Rescheduling**: Reorder blocks with visual feedback
- **📊 Progress Tracking**: Real-time completion tracking and confidence monitoring
- **🏆 Gamification**: Badges, streaks, and completion percentages
- **📈 Subject-Wise Breakdown**: Hours allocation with justifications
- **🎯 Next 7 Days Focus**: Prioritized task list with prerequisite closure
- **📉 Progress Checkpoints**: Weekly assessments with adaptation suggestions

### Smart Prioritization
- Weak and prerequisite-heavy topics scheduled earlier
- High-focus topics placed in preferred study hours
- Lighter tasks (revision, notes) placed in low-energy slots
- 10-15% buffer time for spillovers

## 📁 Project Structure

```
AI_study_Planner/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx         # Input form component
│   │   │   └── StudyPlanViewer.jsx   # Study plan viewer with drag-and-drop
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.js                  # Entry point
│   │   └── index.css                 # Tailwind CSS
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/                  # Node.js backend API
    ├── studyPlanGenerator.js  # Camel AI algorithm
    ├── scheduleBuilder.js     # Schedule builder
    ├── studyPlanService.js   # Main service
    ├── server.js             # Express API server
    └── package.json
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 📝 Input Format

```json
{
  "student": {
    "name": "Aman",
    "college": "XYZ Institute of Technology",
    "branch": "Computer Science Engineering",
    "year": 2026,
    "email": "aman@example.com"
  },
  "subjects": [
    {
      "name": "Data Structures",
      "credits": 4,
      "strong": ["Arrays", "Linked Lists"],
      "weak": ["Trees", "Graphs"],
      "confidence": 3
    }
  ],
  "availability": {
    "weekdays": 3,
    "weekends": 6,
    "preferredTime": "Night"
  },
  "targetDate": "2026-03-15"
}
```

## 📊 Output Features (All Implemented ✅)

### 1. Visual, Easy-to-Scan Schedule ✅
- **Daily calendar view** - Today's schedule in Dashboard
- **7-day weekly view** - Full week in Calendar View
- **Color-coded by cognitive load**:
  - 🔴 RED: High load (weak topics, low confidence, missing prerequisites)
  - 🟡 YELLOW: Medium load (moderate confidence, some weak areas)
  - 🟢 GREEN: Low load (strong topics, high confidence)
- **Clear block type distinction**:
  - 📚 LEARNING: New concept introduction (Days 1-2)
  - ✏️ PRACTICE: Hands-on exercises (Days 2-5)
  - 🔄 REVISION: Review & reinforcement (Weekends)
  - ⏱️ BUFFER: Spillover time (10-15% of schedule)

**Visible in**: 📅 Schedule | 📊 Progress | 📋 Summary

### 2. Subject-Wise Focus Breakdown ✅
- **Hour-based allocation** per subject with percentage breakdown
- **Comprehensive justifications**:
  - "More time allocated due to low confidence and higher credits"
  - "Reduced load for strong topics to avoid over-studying"
  - "Prerequisite-heavy subject prioritized"
  - Custom logic based on weak/strong topics and credit weight
- **Cognitive load indicators** - RED/YELLOW/GREEN badges
- **Topic classification** - Weak & Strong areas highlighted

**Visible in**: 📚 Subjects | 📊 Progress | 📋 Summary

### 3. Smart Prioritization Logic ✅
- **Weak topics first** - Scheduled in Days 1-2 as Learning blocks
- **Prerequisite-heavy topics prioritized** - Before dependent topics
- **High-focus in preferred hours** - Morning/Afternoon/Night optimization
  - High-energy slots for weak/complex topics
  - Low-energy slots for review/notes
- **Lighter tasks in low-energy** - Revision on weekends, notes in afternoon
- **10-15% buffer time** - For unexpected delays and spillovers

**Visible in**: 📅 Schedule | 🎯 Next 7 Days | 📊 Progress

### 4. Actionable Next Steps ✅
- **Specific 7-day focus items** - "Complete Deadlocks before Week 2"
- **Prerequisite reminders** - "Review Trees before starting Graphs"
- **Deadline prevention** - "Complete Laplace Transform before Week 3 to avoid backlog"
- **Numbered action items** - Clear priorities with deadlines
- **AI recommendations** - "Start with weak topics", "Use preferred study hours"

**Visible in**: 🎯 Next 7 Days | 🤖 AI Panel | 💬 Chatbot

### 5. Progress & Adaptation Indicators ✅
- **Weekly confidence checkpoints**:
  - Week 1: Establish baseline understanding
  - Week 2: Deepen weak topic areas
  - Week 3: Practice and strengthen
  - Week 4: Revision and final polish
- **Automatic rebalancing suggestions**:
  - "Confidence improved from 2 → 3; reallocate time"
  - AI-powered adaptive recommendations
  - Dynamic suggestions based on progress
- **Real-time confidence tracking** - Per-subject improvement monitoring
- **Buffer time clearly marked** - ⏱️ blocks throughout schedule

**Visible in**: 📊 Progress | 🎯 Next 7 Days | 📈 Confidence Graph | 🤖 AI Panel

### 6. Outcome-Oriented Summary ✅
- **Estimated completion timeline** - Target date with days remaining
- **Expected confidence improvement**:
  - Original confidence (student's input)
  - Current confidence (live tracking)
  - Expected final confidence (0.5-1.0 improvement per weak area)
- **Reduction in last-minute workload**:
  - Hours saved through smart scheduling
  - Completion percentage tracking
  - Workload evenly distributed across week
  - No cramming needed - weak topics covered early

**Visible in**: 📋 Summary | 📊 Progress | 📈 Confidence Graph

### 7. Additional Features ✅
- **Interactive Confidence Graph** - Daily progression visualization per subject
- **Drag-and-Drop Rescheduling** - Flexible block reordering
- **Real-time Progress Tracking** - Checkbox completion for each block
- **AI Recommendations** - Context-aware suggestions
- **Weekly Chatbot Support** - Q&A about study plan
- **Links & Notes** - Save study resources
- **Export to Text** - Download complete study plan

## 🎯 Subject Selection & Filtering (ALL FEATURES PER SUBJECT)

### How Subject Filtering Works
When you select a subject using the **Global Subject Selector** (top of dashboard), all views show data **ONLY for that subject**:

```
📌 VIEW BY SUBJECT: [All Subjects] [DSA] [OOPS] [DBMS]
                          ↓ Click a subject
                    All views filter instantly!
```

### What Changes When You Select a Subject

| Feature | When Subject Selected | What You See |
|---------|----------------------|------------|
| **📅 Schedule** | Click "DSA" | Only DSA blocks in Today's view |
| **📊 Progress** | Click "OOPS" | OOPS: 45% complete, 4/5 confidence, blocks completed |
| **📈 Confidence Graph** | Click "DBMS" | DBMS confidence line graph across 7 days |
| **📚 Subjects** | Click "Physics" | Physics details: credits, hours, confidence, weak/strong topics |
| **🎯 Next 7 Days** | Click "Chemistry" | Chemistry focus tasks + upcoming blocks breakdown |
| **📋 Summary** | Click "Math" | Math: target date, confidence improvement, hours remaining |

### Real-Time Subject Filtering Example

**Scenario**: Student with 3 subjects (DSA, OOPS, DBMS)

1. **Initial State** - "All Subjects" selected
   - Schedule shows: All 7 blocks (2 DSA + 2 OOPS + 3 DBMS)
   - Progress shows: 3 subject cards with progress for each
   - Next 7 Days shows: All priority items across all subjects

2. **Click "DSA"** - Filter activated
   - Schedule shows: Only 2 DSA blocks (Learning, Practice)
   - Progress shows: DSA only - 50% complete, 4/5 confidence, 1/2 blocks done
   - Subjects shows: DSA card with full details
   - Next 7 Days shows: DSA focus items + 2 DSA blocks scheduled
   - Summary shows: DSA target date, DSA confidence improvement
   - Console logs: Selection switched to DSA

3. **Click "OOPS"** - Filter switches instantly
   - All views update to show ONLY OOPS data
   - Schedule shows: Only OOPS blocks
   - Progress shows: OOPS only - 30% complete, 3/5 confidence
   - Everything switches without page reload ✅

4. **Click "All Subjects"** - Back to combined view
   - All data merged back together
   - See all 3 subjects at once

### Component Updates by Subject Selection

**RightPanel.jsx** - Global selector at top:
```javascript
{allSubjects.length > 1 && (
    <div className="global-subject-selector">
        <button onClick={() => setSelectedSubject('all')}>All Subjects</button>
        {allSubjects.map(subject => (
            <button onClick={() => setSelectedSubject(subject)}>
                {subject}
            </button>
        ))}
    </div>
)}
```

**All views use**: `selectedSubject` state to filter data dynamically

### Features by View (With Filtering)

#### 📅 Schedule View
- **When "All"**: Shows all blocks for all subjects
- **When "DSA"**: Shows only DSA blocks
- **Plus**: Subject filter buttons for quick switching

#### 📊 Progress View  
- **When "OOPS"**: Shows OOPS progress card with:
  - % completion (0-100%)
  - Confidence level 1-5
  - Blocks completed / total
  - Weekly checkpoints for OOPS
- **When "All"**: Shows all 3 subjects' progress cards

#### 📈 Confidence Graph
- **When "Physics"**: Shows Physics confidence line graph
- **When "Chemistry"**: Shows Chemistry confidence line graph
- **Subject selector buttons**: At top of graph for instant switching

#### 📚 Subjects  
- **When "DBMS"**: Shows DBMS card with:
  - Credits (4)
  - Allocated hours (6/week)
  - Progress bar (completion %)
  - Confidence level (1-5 scale)
  - Justification (why this allocation)
  - Weak topics (red badges)
  - Strong topics (green badges)
- **When "All"**: Shows all subjects' cards in one view

#### 🎯 Next 7 Days Focus
- **When "Math"**: Shows Math-specific tasks:
  - Priority action items for Math only
  - Math blocks for next 7 days
  - Completion status for Math blocks
  - Math urgency status
- **When "All"**: Shows all subjects' action items

#### 📋 Summary
- **When "DSA"**: Shows DSA-specific summary:
  - Target completion date (overall)
  - DSA confidence: Current/5 with improvement
  - Expected confidence improvement for DSA
  - DSA hours remaining
  - DSA progress percentage
- **When "All"**: Aggregated data across all subjects

### Key Technical Details

**State Management**:
```javascript
const [selectedSubject, setSelectedSubject] = useState('all');
const [selectedProgressSubject, setSelectedProgressSubject] = useState('all');
```

**Helper Functions**:
```javascript
// Filter blocks by selected subject
const getSubjectBlocks = (subject = selectedSubject) => {
    if (subject === 'all') return all blocks;
    return blocks.filter(b => b.subject === subject);
};

// Filter focus items by subject
const getSubjectNext7DaysFocus = () => {
    if (selectedSubject === 'all') return all items;
    return items mentioning selectedSubject;
};
```

**Sticky Header**:
- Global selector stays at top
- Content area scrolls
- Selection persists across view switches

### Usage Tips

✅ **Quick subject review**: Click subject button → see all its data instantly
✅ **Compare subjects**: Use "All Subjects" to see multiple subjects together
✅ **Track individual progress**: Select subject → watch confidence move from red → yellow → green
✅ **Plan per subject**: Each subject has its own 7-day focus plan
✅ **Detailed breakdown**: See weak/strong topics, hours, credits per subject

## 🧭 Dashboard Navigation

```
📚 AI Study Planner Dashboard (Left Sidebar)
├── 📅 Schedule
│   ├── Today's Tasks
│   ├── 7-Day Calendar View
│   └── Completed Blocks Tracker
├── 💬 Chatbot
│   └── Q&A about your study plan
├── 📊 Progress Tracker
│   ├── Overall Completion %
│   ├── Subject Progress with Confidence Levels
│   └── Weekly Checkpoints
├── 📋 Summary
│   ├── Target Date & Timeline
│   ├── Confidence Improvement (Original → Current → Expected)
│   ├── Hours Completed vs Total
│   └── Overall Progress %
├── 📚 Subjects
│   ├── Hour allocation per subject
│   ├── Justifications for allocation
│   ├── Weak & Strong topics
│   └── Cognitive Load indicators
├── 🎯 Next 7 Days Focus
│   ├── Action items with deadlines
│   ├── Confidence targets this week
│   ├── Urgency indicators
│   └── AI recommendations
├── 📈 Confidence Graph
│   ├── Daily progression visualization
│   ├── Subject-wise tracking
│   └── Confidence targets
├── 🔗 Links & Notes
│   └── Save study resources
└── 📥 Export
    └── Download study plan as text
```

## 🛠️ Technology Stack

### Frontend
- React 18
- Tailwind CSS
- @dnd-kit (drag-and-drop)
- LocalStorage (persistence)

### Backend
- Node.js
- Express.js
- Camel AI (smart algorithm - no external API)

## 📚 API Endpoints

### POST `/api/generate-plan`
Generate study plan from input data.

**Request:**
```json
{
  "student": { ... },
  "subjects": [ ... ],
  "availability": { ... },
  "targetDate": "YYYY-MM-DD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "week": [ ... ],
    "subjectHours": { ... },
    "subjectBreakdown": [ ... ],
    "next7DaysFocus": [ ... ],
    "progressCheckpoints": [ ... ],
    "summary": { ... }
  }
}
```

### GET `/api/health`
Health check endpoint.

### GET `/api/prerequisites`
Get prerequisite mapping information.

## 🎯 Deliverables

✅ **Working Prototype** – Functional MVP that generates personalized study plans
✅ **Adaptive Scheduling Logic** – Accounts for subject difficulty, deadlines, and prerequisite gaps
✅ **Actionable Insights** – Clear guidance on what to study, when, and why
✅ **User-Friendly Interface** – Clean, intuitive design for daily student use

## 📖 Example Usage

### Sample Input
- **Student**: Aman, XYZ Institute, CSE, 2026
- **Subjects**: 
  - Data Structures (4 credits) - Weak: Trees, Graphs - Confidence: 3/5
  - Operating Systems (3 credits) - Weak: Deadlocks, Memory Management - Confidence: 2/5
  - Engineering Mathematics (4 credits) - Weak: Laplace Transform - Confidence: 3/5
- **Availability**: 3 hrs/weekday, 6 hrs/weekend, Preferred: Night
- **Target Date**: 15 March 2026

### Generated Output
- 7-day color-coded schedule
- Subject-wise hours with justifications
- Next 7 days focus priorities
- Progress checkpoints with adaptation suggestions
- Summary with timeline and confidence improvement

## � Dynamic Multi-Subject Tracking (ANY Number of Subjects)

### How It Works
The system automatically detects and tracks **ANY number of subjects** with unlimited subject names. You can create study plans with:
- ✅ **DSA** (Data Structures & Algorithms)
- ✅ **OOPS** (Object-Oriented Programming)  
- ✅ **DBMS** (Database Management Systems)
- ✅ **Physics**, **Chemistry**, **Mathematics**
- ✅ **Any other subject** with any credit value

### Subject Filtering Across All Views

#### 1. **📅 Schedule View** - Filter by Subject
- Shows only blocks for selected subject
- Switch between subjects with buttons
- View "All" or individual subject schedule

#### 2. **📊 Progress View** - Track Per-Subject Confidence
- See progress for each subject independently
- Subject filter buttons at the top
- Confidence level tracked per subject (1-5 scale)
- Progress bars show completion % per subject
- Weekly checkpoints for each subject

#### 3. **📈 Confidence Graph** - Multi-Subject Visualization
- Select any subject from dropdown
- Line graph shows confidence progression
- Color-coded: Green (high), Yellow (medium), Red (low)
- Daily confidence breakdown

### Data Storage Architecture

```javascript
// localStorage structure for user (ID: "user123")
localStorage:
  - studyPlan_user123: { week: [...], subjectBreakdown: [...], ... }
  - progress_user123: {
      completedBlocks: [...],
      completedHours: 15,
      confidenceUpdates: {
        "DSA": 4,           // Dynamic key per subject
        "OOPS": 3,
        "DBMS": 2,
        "Physics": 4,
        ...any subject...
      },
      notes: [],
      links: []
    }
```

### Verification (Check Browser Console)

When you:
1. **Create a study plan** → Console shows:
   ```
   🎯 Study Plan Generated with Subjects: DSA, OOPS, DBMS
   💾 Initialized Confidence Tracking for: DSA, OOPS, DBMS
   ```

2. **Update confidence** → Console shows:
   ```
   ✅ Confidence Updated: DSA → 4/5
   📈 Confidence Levels: {DSA: 4, OOPS: 3, DBMS: 2, ...}
   ✅ Subjects Being Tracked: [DSA, OOPS, DBMS]
   💾 Saved to localStorage as key: progress_user123
   ```

3. **Complete blocks** → Progress updates per subject independently

**📌 Pro Tip**: Open DevTools (F12) → Console to see real-time tracking!

## �🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render/Heroku)
```bash
cd backend
git push heroku main
```

## 🤖 Camel AI

Camel AI is our intelligent adaptive algorithm that:
- Detects prerequisites automatically
- Calculates cognitive load
- Prioritizes weak topics
- Adjusts time allocation dynamically
- Generates actionable micro-tasks
- Provides adaptation suggestions

**No external API required** - All intelligence is built-in!

## 📄 License

MIT

## 🙏 Contributing

Contributions welcome! Please ensure all features are tested and documented.

---

**Happy Studying! 🎓📚**
