# 🌟 BrightPath CRM

> **Student Enquiry & Admissions Lifecycle Management for BrightPath Academy**  
> Built with React 18/19, TypeScript, Vite, Supabase (PostgreSQL + Auth + RLS), and deployed on Vercel.

---

## 📌 1. Project Overview

**BrightPath CRM** is an admissions relationship platform specifically designed for coaching institutes and academies. It unifies the intake, qualification, counselling follow-ups, and enrollment conversion lifecycle into an intuitive, high-performance web application.

### Key Highlights
- **Real-Time Executive Dashboard:** Reconciles 1:1 with database counts. Real-time KPI cards (Total Enquiries, New, Converted, Overdue), conversion rate calculated with division-by-zero safeguards, multi-stage pipeline status progress bars, and intake channel distribution.
- **Lead Intake & Directory:** Search by student name, phone number, and course interest. Instant multi-faceted filtering by Status, Source, and Assigned Counsellor.
- **Pipeline Transitions & Mandatory Audit:** Strict admissions governance requiring documented lost reasons before moving prospects to `Lost`.
- **Actionable Follow-up Engine:** Tasks categorized automatically into Overdue, Upcoming, and Completed with 1-click completion and discussion outcome logging.
- **Immutable Activity Timeline:** Every lead creation, status change, reassignment, discussion note, and follow-up completion writes an audit trail entry.
- **Role-Based Access Control (RBAC):** Admin, Manager, and Counsellor roles protected with PostgreSQL Row Level Security (RLS) policies.
- **Zero-Config Mock Mode:** Complete offline fallback mode with high-fidelity seed data, allowing local testing even without immediate database connection.

---

## 🏗️ 2. Architectural Structure

```
brightpath-crm/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI tokens (Badge, Button, Card, StatCard, Beacon)
│   │   ├── layout/             # Sidebar, Mobile Topbar, Header, LayoutShell
│   │   └── modals/             # SupabaseSetupModal
│   ├── context/
│   │   └── AuthContext.tsx     # Session management, profile sync, and demo role switcher
│   ├── features/
│   │   ├── auth/               # SignInModal, user authentication
│   │   ├── dashboard/          # Executive KPI cards, pipeline charts, overdue widget
│   │   ├── leads/              # LeadTable, LeadFiltersBar, CreateLeadModal, LeadDetailDrawer
│   │   ├── followups/          # FollowupsList, ScheduleFollowupModal, status tabs
│   │   └── settings/           # Profile details, role switcher, API configurations
│   ├── services/
│   │   ├── auth.service.ts     # Supabase Auth integration
│   │   ├── leads.service.ts    # Lead CRUD, status transitions, search, and filtering
│   │   ├── followups.service.ts# Follow-up scheduling, overdue categorization, completion
│   │   └── activities.service.ts# Activity audit trail logger and timeline reader
│   ├── types/
│   │   ├── database.types.ts   # Database schema TypeScript interfaces
│   │   └── navigation.ts       # Navigation & role definitions
│   ├── lib/
│   │   └── supabaseClient.ts   # Resilient typed Supabase client & environment checker
│   ├── index.css               # Design system tokens, focus-rings, responsive rules
│   ├── App.tsx                 # Root router and state coordinator
│   └── main.tsx                # React DOM entrypoint
├── supabase/
│   └── migrations/
│       ├── 20261017000001_initial_schema.sql  # Tables, foreign keys, triggers
│       ├── 20261017000002_rls_policies.sql   # Row Level Security policies
│       └── 20261017000003_seed_data.sql      # Seed profiles, leads, follow-ups
├── plan.md                     # Master execution plan & roadmap
└── package.json
```

---

## 🗄️ 3. Database Schema & Security (PostgreSQL + Supabase)

### Relational Entity-Relationship Model
- **`profiles`**: User profiles linked to `auth.users(id)` with roles (`admin`, `manager`, `counsellor`).
- **`leads`**: Student prospects containing contact information, course interest, acquisition source, pipeline stage (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`), and mandatory `lost_reason`.
- **`follow_ups`**: Scheduled tasks with `due_at` timestamp, notes, status (`pending`, `completed`, `cancelled`), and completion outcome timestamps.
- **`activities`**: Append-only immutable audit trail capturing who performed what action on which lead.

### Row Level Security (RLS) Rules
- **Admins & Managers:** Full read and write access across all records in the organization.
- **Counsellors:** Can view all active leads, create enquiries, update their assigned leads, schedule follow-ups, and log activity events.

---

## 🚀 4. Local Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on `v24.21.0`)
- **npm**: v9.0.0 or later

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/Roheethrana/brightpath-crm.git
cd brightpath-crm
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your Supabase credentials in `.env`:
```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Note:** If you run without `.env`, BrightPath CRM automatically boots into **High-Fidelity Mock Mode** with sample data so you can test every workflow offline.

### Step 3: Run Database Migrations (In Supabase)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Run the migrations in order:
   - `supabase/migrations/20261017000001_initial_schema.sql`
   - `supabase/migrations/20261017000002_rls_policies.sql`
   - `supabase/migrations/20261017000003_seed_data.sql`

### Step 4: Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 5. Testing & Verification Checklist

| Area | Test Steps | Expected Outcome |
| :--- | :--- | :--- |
| **Authentication** | Click *Sign In* in the header, enter credentials or use demo role switchers in Settings | Active user badge displays in header, session restores on page reload |
| **Lead Creation** | Click *Add New Lead*, fill in student details, submit | Enquiry appears instantly at top of directory and in dashboard totals |
| **Search & Filters** | Type in search bar, select status "Converted", or click "Reset" | Table filters in real-time without reloading |
| **Status Transition** | Open a lead, change status from `New` to `Qualified` | Status badge updates, activity log records event |
| **Mandatory Lost Reason** | Transition lead to `Lost` | Validation modal requires choosing or typing a reason before updating |
| **Follow-up Engine** | Click *Schedule Follow-up*, set date in past or future | Categorizes automatically into *Overdue* or *Upcoming* tabs |
| **Task Completion** | Click *Mark Done* on an overdue follow-up card | Prompts for outcome note, moves task to *Completed*, logs activity |
| **Dashboard KPIs** | Compare KPI totals with counts on Leads and Follow-ups pages | Numbers reconcile 1:1; conversion rate shows safe percentage |
| **Keyboard A11y** | Press `Escape` while any modal or drawer is open | Modal dismisses smoothly without mouse click |

---

## 🌐 6. Deployment to Vercel

1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Set Framework Preset to **Vite**.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will run `npm run build` and output the production bundle.

---

## 📄 7. License & Credits
Developed for **BrightPath Academy** as part of the BrightPath Admissions CRM suite.  
Open-source under the MIT License.
