import { SpecSection } from '../types';

export const SPEC_SECTIONS: SpecSection[] = [
  {
    id: 'pitch',
    number: 1,
    title: 'One-Paragraph Pitch & Market Positioning',
    summary: 'Clear articulation of Ironmate and how it wins against Strong, Hevy, and Fitbod.',
    content: `### 1. The One-Paragraph Pitch
**Ironmate is the gym companion that already knows what you should do today.** Built for real floor conditions—sweaty hands, crowded squat racks, and erratic schedules—Ironmate strips away cognitive friction by briefing you in the morning with sleep-adjusted targets, logging sets in under two taps with high-contrast 1-meter rack legibility, and debriefing your session at night with evidence-based progression cues. While **Strong** has stagnated into a cold, abandoned log without programming intelligence, **Hevy** prioritizes social scrolling over genuine coaching, and **Fitbod** generates chaotic, untrusted algorithmic "exercise soup," Ironmate bridges the gap: combining Strong's lightning-fast logging speed with authentic periodized strength programming, quiet contextual AI adaptations, and dignified, privacy-first progress sharing.`,
  },
  {
    id: 'personas',
    number: 2,
    title: 'User Personas (4) & Jobs-To-Be-Done',
    summary: 'Beginner, Intermediate, Advanced Lifter, and Female Lifter with specific JTBD.',
    content: `### 2. User Personas & Jobs-To-Be-Done (JTBD)

#### Persona 1: "First-Timer Maya" (Beginner, 0–6 months)
* **Demographics:** 24, Product Designer, trains 3x/week at a commercial gym.
* **Psychology:** Intimidated by the free weight area, worried about looking foolish, unsure how to rack/unrack weights, nervous to ask someone if a bench is free.
* **Core Pain Points:** Generic apps say "3x10 Squat" without saying what weight to start with; doesn't know what to do when a machine is occupied; hates fitness apps that shame her about calories.
* **Job-To-Be-Done:** *"When I step into an intimidating gym during peak hour, I want a calm, step-by-step companion that tells me exactly which bench to use, how to find my starting weight with zero ego, and what to do if someone is on the machine, so I feel competent, safe, and walk out having done a real workout."*
* **Ironmate Solution:** "First Week in a Real Gym" onboarding track, RIR 3 starting weight protocol, video cues emphasizing safe racking and spotter etiquette, 1-tap machine substitution that preserves stimulus.

---

#### Persona 2: "Progressing Marcus" (Intermediate, 1–3 years)
* **Demographics:** 29, Software Engineer, trains 4x/week (Upper/Lower or PPL).
* **Psychology:** Wants to break past plateaus (bench stuck at 85kg, squat at 110kg). Obsessed with progressive overload but tired of calculating percentages manually.
* **Core Pain Points:** Strong doesn't tell him when to deload or add 2.5kg; Excel sheets are miserable to edit with chalky fingers; gets frustrated when minor fatigue causes missed reps.
* **Job-To-Be-Done:** *"When I show up to my third workout of the week feeling slightly drained, I want the app to automatically compute my progressive overload targets and adjust volume landmarks if my bar speed stalls, so I keep gaining strength without burning out or spinning my wheels."*
* **Ironmate Solution:** Morning brief calculates fatigue adjustments; auto-progression policies (e.g. +2.5kg when all sets hit target at RIR ≥ 2); plateau detection triggering scheduled deloads.

---

#### Persona 3: "Dialed-In Dave" (Advanced / Pro Lifter, 5+ years)
* **Demographics:** 34, Senior Consultant & Competitive Powerlifter/Bodybuilder.
* **Psychology:** Already has his own periodized coach-written plan (RPE 8, cluster sets, drop sets). Despises bloat, animations, chatbot spam, and forced social feeds.
* **Core Pain Points:** Hevy is too noisy with selfies; Fitbod suggests nonsensical exercises; needs sub-second set completion and precise plate math for calibrated 20kg bars.
* **Job-To-Be-Done:** *"When I am under a 180kg barbell, I want a high-contrast logger that I can see from 1 meter away on my phone mount, tap once with sweaty thumbs, and have it auto-start my 3-minute rest timer with zero popups or AI chatter, so my focus remains 100% on the iron."*
* **Ironmate Solution:** Sweaty-finger UX, one-handed logging, plate calculator breakdown (25kg/20kg/15kg/10kg/5kg/2.5kg/1.25kg), CSV/JSON import & export, full RPE/RIR tracking, completely offline-first.

---

#### Persona 4: "Cycle-Aware Elena" (Intermediate Female Lifter, 28)
* **Demographics:** 28, Physical Therapist, lifts 4x/week, runs on weekends.
* **Psychology:** Frustrated by "pink it and shrink it" apps full of detox teas, waist trainers, and calorie guilt; wants serious compound lifting tailored to female pelvic biomechanics and hormonal recovery rhythms.
* **Core Pain Points:** Menstrual luteal phase causes unpredicted strength dips which generic apps flag as "performance failures"; squat cues written for narrow male hips cause hip impingement.
* **Job-To-Be-Done:** *"When I train during high-progesterone phases or return from pelvic strain, I want dignified, opt-in physiological context that adapts volume expectations without treating me as fragile, so I can train sustainably without feeling defective."*
* **Ironmate Solution:** Opt-in cycle-aware recovery adjustments (recommending RIR cushions rather than arbitrary deloads), female-biomechanics cues (wider stance/toe flare for pelvic clearance), neutral strength percentiles without pass/fail or calorie shaming.`,
  },
  {
    id: 'ia',
    number: 3,
    title: 'Information Architecture & Tab Structure',
    summary: 'Bottom navigation, modal hierarchies, and screen relationships.',
    content: `### 3. Information Architecture & Navigation Hierarchy

\`\`\`
Root Navigation (Expo Router Tab Layout)
│
├── Tab 1: [Today] (Daily Companion Loop)
│   ├── Morning Briefing Card (06:00 - 12:00)
│   │   ├── Readiness Gauge & Sleep Note
│   │   ├── Scheduled Workout Overview (Est. Duration, Target Lifts)
│   │   └── Quick Actions: [Start Gym Mode] / [Swap to Crowded-Gym 30m] / [Rest Flow]
│   ├── Active Floor Launcher (During scheduled window)
│   └── Night Debrief & Recap (Post-workout)
│       ├── Grade Breakdown (Volume adherence, RPE discipline, PR detections)
│       ├── 15-Second Share Card Generator
│       └── Tomorrow Preview
│
├── Tab 2: [Routines] (Programming & Periodization)
│   ├── Active Program Hero (Week X of Y, Next Session Day)
│   ├── Saved Custom Routines (PPL, Upper/Lower, 5/3/1, Full Body)
│   ├── Auto-Progression Policy Editor (+2.5kg threshold rules)
│   └── Community / Coach Routine Import (via Deep Link)
│
├── Tab 3: [Gym Mode] (Full-Screen Modal / Active Session)
│   ├── [Persistent Status Bar] Rest Timer (Countdown, +30s, -15s, sound/vibrate)
│   ├── Exercise Header (Name, Set X of Y, Target Muscle, Video/Cue Drawer)
│   ├── Historical Context Banner (Last: 80kg x 6,6,5 @ RPE 8)
│   ├── Prescribed Target Banner (Today: 82.5kg x 6,6,6 @ RIR 2)
│   ├── Steppers: Weight (±1.25kg, ±2.5kg, ±5kg) & Reps (±1)
│   ├── RPE / RIR Selector Pill
│   ├── GIANT "COMPLETE SET" CTA (56px minimum height, high-contrast)
│   └── Bottom Utility Dock:
│       ├── [Plate Calculator Modal] (Barbell breakdown per side)
│       ├── [Instant Substitute Sheet] (Biomechanical equivalent)
│       ├── [Warmup Calculator] (50%, 70%, 85% ramp sets)
│       └── [Cancel / Finish Workout]
│
├── Tab 4: [Library] (Exercise Knowledge Base)
│   ├── Search & Filter (Muscle group, equipment, beginner-friendly)
│   ├── Exercise Detail View:
│   │   ├── High-framerate biomechanical loop / female & male form
│   │   ├── Plain English Setup, Execution, and Common Mistakes
│   │   ├── Biomechanical Alternatives Table (with transfer rationale)
│   │   └── Personal History & Estimated 1RM Progression Curve
│
└── Tab 5: [Profile & Insights] (Private Vault & Tracking)
    ├── Strength Radar & Volume Landmarks (Chest, Back, Quads, etc.)
    ├── PR Trophy Vault (Auto-detected all-time records)
    ├── Private Progress Photos (Encrypted Vault, Biometric Lock)
    ├── Cycle & Physiological Preferences (Opt-in toggle)
    └── Settings (Units: kg/lb, Bar weight: 20kg/15kg, CSV Export)
\`\`\``,
  },
  {
    id: 'onboarding',
    number: 4,
    title: 'Full Onboarding Flow (Screen by Screen)',
    summary: 'Step-by-step 3-minute onboarding turning beginners into confident lifters.',
    content: `### 4. Full Onboarding Flow (Screen-by-Screen Specification)

*Goal: Generate a personalized, evidence-based 4-week training block in under 3 minutes, with an immediate, non-intimidating primer on gym floor realities.*

---

#### Screen 1: The Promise & Core Motivation
* **UI:** Dark, clean layout. Bold headline: *"The gym companion that already knows what you should do today."*
* **Question:** *"What brings you to the barbell?"*
* **Options (Single Select):**
  1. Build Muscle & Hypertrophy (*Maximize lean mass with volume landmarks*)
  2. Pure Strength & Power (*Move heavier loads on compound lifts*)
  3. Body Recomposition (*Shed fat while preserving lifting strength*)
  4. General Athletic Longevity (*Move better, feel resilient, stay consistent*)
* **Micro-copy:** *"No generic calorie-shaming. Just honest training principles."*

---

#### Screen 2: Experience Level & Honest Baseline
* **Question:** *"How comfortable are you in a free-weight room?"*
* **Options:**
  1. **New to Free Weights (0–6 months):** *"Machines feel okay, but squat racks and barbells feel intimidating."* -> *Triggers "First Week in a Real Gym" track.*
  2. **Consistent Lifter (6–24 months):** *"I know the main lifts, have run basic routines, and want progressive overload."*
  3. **Advanced Lifter (2+ years):** *"I have dialed numbers, know my RPE/RIR, and want zero friction logging."*

---

#### Screen 3: Equipment Reality & Gym Archetype
* **Question:** *"Where will you be training?"*
* **Options:**
  1. **Commercial Gym:** Full barbells, dumbbells up to 50kg, cables, machines.
  2. **Home Garage / Power Rack:** Barbell, plates, bench, pull-up bar.
  3. **Hotel / Apartment Gym:** Dumbbells up to 22kg, cable tower, adjustable bench.
  4. **Basic Machine Circuit:** Plate-loaded or pin machines, cardio equipment.
* **Smart Filter:** Disables barbell prescriptions if user selects Hotel or Basic Machines.

---

#### Screen 4: Schedule & Time Budget
* **Question:** *"How many days will you realistically commit to?"*
* **Options:**
  * 3 Days / week (Prescribes: Full Body A/B/C or Push/Pull/Legs)
  * 4 Days / week (Prescribes: Upper / Lower A/B split)
  * 5 Days / week (Prescribes: PPL + Upper/Lower hybrid)
* **Session Duration Limit:** Slider [30m | 45m | 60m | 75m+]. Ironmate limits accessory volume to fit exact time budget.

---

#### Screen 5: Dignified Physiology & Optional Context (Non-Discriminatory)
* **Question:** *"Help us dial in load increments and recovery assumptions."*
* **Inputs:**
  * Biological Sex / Norms: [Female | Male | Prefer not to say] *(Context: used strictly for 1.25kg micro-loading defaults and biomechanical cue suggestions, never pass/fail scoring)*
  * Cycle-Aware Training (Opt-In Toggle): *"Adjust volume recommendations based on hormonal energy phases without canceling your lifts."*
  * Current Pain / Joint Flags: [Shoulder impingement | Lower back strain | Patellar knee irritation | None]
* **Micro-copy:** *"We will automatically suggest joint-friendly alternatives (e.g. Neutral Grip DB Press for shoulder flags)."*

---

#### Screen 6: "First Week in a Real Gym" Primer (Beginner Branch Only)
* **Card 1: The RIR 3 Method:** *"Never guess weights or lift until failure on day 1. Pick a dumbbell where you could do 3 more reps with pristine form. That is your working baseline."*
* **Card 2: Gym Floor Etiquette:**
  * *"Racking weights: Put plates back where you found them—don't leave 20s behind 5s."*
  * *"Sharing a bench: Asking 'Can I work in with you?' is 100% normal. Lifters will happily say yes."*
  * *"Wiping down pads: Quick 5-second wipe with paper towel when you finish."*

---

#### Screen 7: Program Generation Reveal & Instant Commitment
* **UI:** Live programmatic builder displays:
  * Program Title: e.g. *"Linear Foundations: 4-Week Upper / Lower"*
  * Week 1 Focus: Form Calibration & Starting Numbers (RIR 2–3)
  * Auto-progression: *+2.5kg on compounds upon clean completion.*
* **CTA Button:** *"Accept Program & Schedule Day 1"* -> Routes straight to Tab 1 (Today).`,
  },
  {
    id: 'gym_mode',
    number: 5,
    title: 'Gym Mode Wireframe & Sweaty-Finger UX Specification',
    summary: 'Single-screen floor logger readable from 1 meter away on a squat rack.',
    content: `### 5. Gym Mode Wireframe Description & Floor UX Specification

#### Core Screen Architecture (Single Viewport — Zero Page Navigations to Log a Set)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ [× Exit Session]         Push A: Week 3 Day 1       (42:15) │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ REST TIMER:  01:45 remaining   [+30s]  [-15s]  [🔊 BEEP] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ EXERCISE 1 OF 4                                             │
│ BARBELL BENCH PRESS                           [Form Cues ℹ️] │
│ Chest (Sternal) • Barbell & Flat Bench                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ LAST SESSION:   80.0 kg  ×  6, 6, 5  @ RPE 8.5          │ │
│ │ TODAY TARGET:   82.5 kg  ×  6, 6, 6  @ RIR 2 (+2.5kg)   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  SET 2 OF 3  •  WORKING SET                                 │
│                                                             │
│  WEIGHT (KG)                         REPS                   │
│ ┌──────────────────────┐            ┌─────────────────────┐ │
│ │ [-2.5]  82.5  [+2.5] │            │  [-]    6    [+]    │ │
│ └──────────────────────┘            └─────────────────────┘ │
│  [1.25] [5.0] [Plate Calc]           Target: 6 reps (RIR 2) │
│                                                             │
│  EFFORT / RIR:                                              │
│  [ RIR 3 (Easy) ]   [ RIR 2 (Target) ]   [ RIR 1 ]   [ RIR 0 ]
│                                                             │
│ ╔═════════════════════════════════════════════════════════╗ │
│ ║                                                         ║ │
│ ║           ✓ COMPLETE SET 2 (82.5kg × 6)                 ║ │
│ ║              (56px Giant Tap Target)                    ║ │
│ ║                                                         ║ │
│ ╚═════════════════════════════════════════════════════════╝ │
│                                                             │
│ [ 🔄 Swap Exercise ]   [ ⏩ Skip Set ]   [ 📝 Note ]   [ 🏋️ Plate Calc ]
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Key Floor Interaction Rules
1. **Sweaty-Finger Steppers:** Big chunky buttons (minimum 48x48px). Long-press on \`+\` or \`-\` accelerates stepping. Quick micro-steppers for calibrated weights (+1.25kg, +2.5kg, +5.0kg).
2. **Instant Plate Calculator Drawer:** Tapping \`Plate Calc\` reveals a graphical barbell showing exactly which plates go on each side (e.g. for 82.5kg on 20kg bar: [20kg + 10kg + 1.25kg] per side).
3. **Stimulus-Preserving Exercise Swap:** If the flat bench is occupied, tapping \`Swap Exercise\` provides 3 instant pre-ranked options:
   * Option A: *Incline Dumbbell Press* (Keeps pressing stimulus, safe shoulder path).
   * Option B: *Machine Chest Press* (Zero setup time, no spotter needed).
   * User selects one; Ironmate automatically converts the target weight to match dumbbell/machine historical ratios!
4. **Auto-Rest Timer Trigger:** Completing a set automatically fires the rest countdown timer with audio chime and haptic buzz at 00:00. Does NOT lock the screen; lifter can adjust the next set's weight while resting.`,
  },
  {
    id: 'roadmap',
    number: 6,
    title: '12-Week Roadmap for a Solo React Native Founder',
    summary: 'Phased MVP vs v1 vs v2 delivery plan focusing on speed, offline, and retention.',
    content: `### 6. Feature Roadmap (12 Weeks for Solo React Native Founder)

#### Phase 1: MVP (Weeks 1–4) — "The Unbeatable Logger"
* **Week 1: Core Engine & DB Architecture:**
  * Supabase project setup, WatermelonDB / SQLite local-first sync schema.
  * Zod validation pipeline for sets, reps, RPE, and exercise models.
* **Week 2: Sweaty-Finger Gym Mode:**
  * Full-screen high-contrast Gym Mode UI.
  * Rest timer with native notifications and haptic feedback.
  * Plate calculator module (kg/lb barbell and plate inventory).
* **Week 3: Exercise Library & Starter Programs:**
  * 150 verified foundational compound and isolation exercises with muscle tags and cues.
  * 3 starter periodized programs (3-day Full Body, 4-day Upper/Lower, 3-day Novice Linear).
  * Auto-progression engine (+2.5kg threshold calculation).
* **Week 4: History, PR Detection & Offline Stress Testing:**
  * Automatic PR calculation (estimated 1RM using Epley and Brzycki formulas).
  * Offline test in airplane mode: 100% session persistence and conflict-free sync queue.
  * Internal TestFlight / Google Play closed beta release.

---

#### Phase 2: v1 Launch (Weeks 5–8) — "The Daily Ritual"
* **Week 5: Morning Brief & Evening Debrief:**
  * Daily companion UI loop: morning notification briefing today's workout and estimated duration.
  * Evening session grade card (volume vs plan, RPE discipline).
* **Week 6: Onboarding & First Week in Gym Track:**
  * 3-minute personalized program generator.
  * Gym floor etiquette and starting weight (RIR 3) interactive primers.
* **Week 7: Wearables & Recovery Integration:**
  * Apple HealthKit and Android Health Connect read integration (Sleep hours, Resting HR, HRV).
  * Load adjustment suggestions (e.g. "Sleep under 6h: hold load, drop isolation set").
* **Week 8: Viral Share Cards & RevenueCat:**
  * 15-second Story-ready recap cards (pure aesthetic, dark high-contrast typography, tonnage).
  * RevenueCat paywall configuration (Free tier: unlimited logging + 2 programs; Pro: periodization + recovery adjustments).
  * Public App Store / Google Play Launch.

---

#### Phase 3: v2 Expansion (Weeks 9–12) — "Intelligence & Social Proof"
* **Week 9: Tightly-Scoped AI Floor Coach:**
  * Structured Gemini tool calling: instant machine substitutions, plateau analysis, travel workout generator.
  * Guardrails strictly enforced (zero medical advice, zero calorie shaming).
* **Week 10: Deep Link Program Sharing & Gym Buddy Linkup:**
  * "Copy this routine in 1 tap" URL schema.
  * Coarse gym check-in ("Training at MetroFlex at 6pm — need a spot?").
* **Week 11: Nutrition Lite (Protein-First):**
  * Protein and calorie baseline calculator based on goals and training volume.
  * Quick-tap meal logger (favorites and recent items).
* **Week 12: CSV Data Porter & Power-User Tools:**
  * 1-click import from Strong and Hevy CSV exports to welcome platform switchers.
  * Web-based program builder companion for desktop editing.`,
  },
  {
    id: 'supabase',
    number: 7,
    title: 'Supabase Database Schema & RLS Policies',
    summary: 'PostgreSQL schema with Row Level Security, tables, indexes, and sync structures.',
    content: `### 7. Supabase Database Schema (SQL DDL & RLS Policies)

\`\`\`sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. USERS & PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  preferred_unit text check (preferred_unit in ('kg', 'lb')) default 'kg',
  default_bar_weight_kg numeric(5,2) default 20.0,
  cycle_tracking_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can read/update own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- 2. EXERCISE KNOWLEDGE BASE (System Verified + User Custom)
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references public.profiles(id) on delete set null, -- null = global verified
  name text not null,
  target_muscle text not null,
  secondary_muscles text[] default '{}',
  equipment text not null,
  difficulty text default 'beginner',
  setup_cue text,
  execution_cue text,
  common_mistake text,
  female_consideration text,
  default_rest_seconds int default 120,
  is_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exercises enable row level security;
create policy "Anyone can read verified exercises"
  on public.exercises for select
  using (is_verified = true or auth.uid() = created_by);
create policy "Users can create custom exercises"
  on public.exercises for insert
  with check (auth.uid() = created_by);

-- 3. PROGRAMS & ROUTINES
create table public.programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  duration_weeks int default 4,
  days_per_week int default 4,
  progression_rule text default 'linear_rir_threshold',
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.programs enable row level security;
create policy "Users manage own programs"
  on public.programs for all
  using (auth.uid() = user_id);

-- 4. WORKOUT SESSIONS (Logged Workouts)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  program_id uuid references public.programs(id) on delete set null,
  name text not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone,
  duration_seconds int,
  total_volume_kg numeric(10,2) default 0.0,
  readiness_score int check (readiness_score between 0 and 100),
  session_grade text,
  coach_debrief_note text,
  is_completed boolean default false,
  synced_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sessions enable row level security;
create policy "Users manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id);

-- 5. SETS (Atomic Log Records)
create table public.sets (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete restrict not null,
  set_number int not null,
  set_type text check (set_type in ('warmup', 'working', 'drop', 'failure', 'cluster')) default 'working',
  weight_kg numeric(6,2) not null,
  reps int not null,
  target_reps int,
  rpe numeric(3,1),
  rir int,
  is_completed boolean default true,
  is_personal_record boolean default false,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sets enable row level security;
create policy "Users manage own sets"
  on public.sets for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = sets.session_id and s.user_id = auth.uid()
    )
  );

-- 6. PERSONAL RECORDS (Auto-Aggregated Trophy Vault)
create table public.personal_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  record_type text check (record_type in ('1rm_est', 'weight_for_reps', 'volume')),
  weight_kg numeric(6,2) not null,
  reps int not null,
  estimated_1rm_kg numeric(6,2),
  achieved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  session_id uuid references public.sessions(id) on delete set null
);

alter table public.personal_records enable row level security;
create policy "Users manage own PRs"
  on public.personal_records for all
  using (auth.uid() = user_id);

-- 7. PROGRESS VAULT (Private Media)
create table public.progress_vault (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null, -- Private encrypted Supabase storage bucket
  bodyweight_kg numeric(5,2),
  notes text,
  captured_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.progress_vault enable row level security;
create policy "Vault is strictly private to user"
  on public.progress_vault for all
  using (auth.uid() = user_id);

-- INDEXES FOR SUB-SECOND QUERIES
create index idx_sessions_user_date on public.sessions(user_id, started_at desc);
create index idx_sets_session on public.sets(session_id);
create index idx_sets_exercise on public.sets(exercise_id, logged_at desc);
create index idx_prs_user_exercise on public.personal_records(user_id, exercise_id);
\`\`\``,
  },
  {
    id: 'expo_router',
    number: 8,
    title: 'Screen List & File Tree for Expo Router',
    summary: 'Directory structure, route conventions, modal setups, and deep link schemas.',
    content: `### 8. Screen List for Expo Router (\`app/\` File Tree)

\`\`\`
app/
├── _layout.tsx                     # Global Root Providers: QueryClient, Auth, OfflineWatermelonDB
├── index.tsx                       # Auth Gate / Root Redirect Controller
│
├── (auth)/                         # Unauthenticated Flow
│   ├── _layout.tsx                 # Stack Layout
│   ├── welcome.tsx                 # Brand splash and value proposition
│   ├── login.tsx                   # Magic link / Apple / Google SSO
│   └── register.tsx                # Account creation
│
├── (onboarding)/                   # First-Time Experience (3-min wizard)
│   ├── _layout.tsx                 # Progress Header Stack
│   ├── goal.tsx                    # Hypertrophy, Strength, Recomp
│   ├── experience.tsx              # Beginner vs Intermediate vs Pro
│   ├── equipment.tsx               # Commercial, Home, Hotel, Machines
│   ├── schedule.tsx                # Days/week & session duration
│   ├── physiology.tsx              # Micro-loading & optional cycle tracking
│   ├── beginner-primer.tsx         # RIR 3 method & gym floor etiquette
│   └── program-reveal.tsx          # 4-week block preview & commit
│
├── (tabs)/                         # Main App Experience (Bottom Tabs)
│   ├── _layout.tsx                 # 5-Tab Bar (Sweaty-Finger Spacing)
│   ├── today/                      # Daily Companion Loop
│   │   ├── index.tsx               # Morning Brief / Ready State / Evening Debrief
│   │   └── share-card.tsx          # 15s Story share modal
│   ├── routines/                   # Programs & Workouts
│   │   ├── index.tsx               # Active program & custom routines list
│   │   ├── [id].tsx                # Routine detail & exercise order editor
│   │   └── create.tsx              # Routine builder with progression policy
│   ├── library/                    # 800+ Exercise Wiki
│   │   ├── index.tsx               # Search, filters, muscle map selector
│   │   ├── [id].tsx                # Cues, video loop, biomechanical alternatives
│   │   └── custom.tsx              # Create custom user exercise
│   └── profile/                    # Vault & Analytics
│       ├── index.tsx               # Volume landmarks, PR trophy room
│       ├── prs.tsx                 # All-time PR progression curves
│       ├── vault.tsx               # Encrypted progress photo vault
│       └── settings.tsx            # Units (kg/lb), bar weights, CSV export
│
├── (session)/                      # Full-Screen Active Gym Floor Modal
│   ├── _layout.tsx                 # Stack with gestureDisabled: true
│   ├── gym-mode.tsx                # THE CORE LOGGER: steppers, targets, giant button
│   ├── plate-calculator.tsx        # Visual plate breakdown per side
│   ├── swap-exercise.tsx           # Stimulus-matched substitution picker
│   ├── warmup-generator.tsx        # Ramp sets calculator
│   └── summary.tsx                 # Finish workout celebration & grade
│
└── +not-found.tsx                  # Deep link fallback
\`\`\``,
  },
  {
    id: 'ai_coach',
    number: 9,
    title: 'AI Coach Tool/Function List & System Prompt',
    summary: 'Strictly scoped functions and prompt: no bro-science, no medical advice, no calorie guilt.',
    content: `### 9. AI Coach Tool/Function List & System Prompt

#### Strict Architectural Boundary
The AI Companion in Ironmate is **NOT** a freeform conversational chatbot. It is a server-side programmatic co-pilot executing strictly typed function calls that inspect real user logs and produce structured training adjustments.

#### Available Tool Declarations (JSON Schema)
\`\`\`json
[
  {
    "name": "suggest_exercise_substitution",
    "description": "Finds a biomechanically equivalent exercise when gym equipment is taken, preserving muscle length-tension curve.",
    "parameters": {
      "type": "object",
      "properties": {
        "current_exercise_id": { "type": "string" },
        "reason": { "type": "string", "enum": ["equipment_taken", "joint_pain", "fatigue_too_high"] },
        "available_equipment": { "type": "string", "enum": ["dumbbells", "cables", "machines", "bodyweight"] }
      },
      "required": ["current_exercise_id", "reason", "available_equipment"]
    }
  },
  {
    "name": "calculate_progression_target",
    "description": "Determines next session weight and reps using double progression and RIR thresholds.",
    "parameters": {
      "type": "object",
      "properties": {
        "exercise_id": { "type": "string" },
        "last_sets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "weight_kg": { "type": "number" },
              "reps": { "type": "integer" },
              "rir": { "type": "integer" }
            }
          }
        },
        "target_rep_range": { "type": "string" }
      },
      "required": ["exercise_id", "last_sets", "target_rep_range"]
    }
  },
  {
    "name": "generate_travel_workout",
    "description": "Constructs an urgent 30-45 minute workout adhering to hotel gym constraints.",
    "parameters": {
      "type": "object",
      "properties": {
        "time_minutes": { "type": "integer" },
        "muscle_focus": { "type": "string" },
        "max_dumbbell_weight_kg": { "type": "number" }
      },
      "required": ["time_minutes", "muscle_focus"]
    }
  }
]
\`\`\`

#### Production System Prompt
\`\`\`text
You are IRONMATE, an evidence-based strength coach and quiet gym companion.
Your philosophy:
1. Grounded in peer-reviewed exercise science (Schoenfeld, Helms, Israetel, Beardsley).
2. Progressive overload, volume landmarks (MEV/MAV/MRV), and fatigue management govern all suggestions.
3. Tone: Calm, direct, competent, adult. Like an experienced coach who already has the bar warmed up for you.

CRITICAL GUARDRAILS:
- NEVER use generic gym-bro slang ("crush it!", "beast mode", "no pain no gain", "let's go champ").
- NEVER give medical diagnosis or injury rehab protocols. If sharp pain is mentioned, immediately advise: "Stop the movement. Substitute with a pain-free variation or consult a licensed physical therapist."
- NEVER suggest crash diets or extreme deficits. Do not calorie-shame.
- For beginners: Always default to RIR 2-3 (leaving 2-3 clean reps in reserve). Never prescribe failure sets on axial compound lifts (Squat, Deadlift, OHP).
- Explain the 'why' in one simple sentence citing progressive overload, stimulus-to-fatigue ratio, or joint mechanics.
\`\`\``,
  },
  {
    id: 'copy_deck',
    number: 10,
    title: 'Empty-State & Copy Deck',
    summary: 'Calm, competent micro-copy for empty states, PR celebrations, and fatigue notices.',
    content: `### 10. Empty-State & Micro-Copy Deck

#### Core Voice Guidelines
* **Do:** Speak like a respected Olympic lifting or hypertrophy coach standing on the platform.
* **Don't:** Sound like a fitness influencer, a push notification spammer, or an aggressive drill sergeant.

---

| Context / Screen | Bad (Generic Bro App) | Ironmate (Calm & Competent) |
| :--- | :--- | :--- |
| **Morning Brief (Good Sleep)** | *"Rise and grind beast! Time to smash your chest today! Let's get huge!"* | *"Today is Push A. 62 min estimated. Sleep baseline is solid. Target is 82.5kg on Bench Press for 3 clean sets of 6."* |
| **Morning Brief (Short Sleep)** | *"No excuses! Champions train even when tired! Drink an extra pre-workout!"* | *"Sleep was 5h 15m. Your nervous system is under-recovered. Keep the work sets at RIR 3 and drop the extra lateral raise sets to manage systemic fatigue."* |
| **Empty History (New User)** | *"You haven't worked out yet! Don't be lazy, hit the gym now!"* | *"Your slate is clean. Complete your first session to calibrate baseline volume and starting weights."* |
| **Plateau / Missed Target** | *"FAIL! You didn't hit your reps today. Better train harder next week."* | *"You hit 5 reps instead of 6 on set 3. That is normal fatigue accumulation. We will hold 82.5kg next session rather than adding weight."* |
| **Deload Suggestion** | *"Take a break bro, you look burnt out."* | *"Performance has dipped across two consecutive pulling sessions while RPE climbed to 9.5. Suggesting a 1-week planned deload to clear accumulated fatigue."* |
| **New Personal Record** | *"BOOM! NEW PR BRO!! YOU ARE A BEAST! SHARE THIS RIGHT NOW!"* | *"Personal record: 99.5kg estimated 1RM (+3.3kg). Clean bar path and rep speed preserved."* |
| **Rest Day Message** | *"REST DAY?! While you're resting someone else is outworking you!"* | *"Scheduled recovery. Muscle protein synthesis and connective tissue remodeling happen during rest. Your streak is protected."* |`,
  },
  {
    id: 'analytics',
    number: 11,
    title: 'Analytics Events & Retention Funnel',
    summary: 'PostHog telemetry tracking the North Star metric and viral sharing loops.',
    content: `### 11. Analytics Event Taxonomy & Telemetry Funnel

#### North Star Funnel: Onboarding -> First Workout -> Week 4 Retention
\`\`\`
[onboarding_started]
      │
      ▼
[onboarding_completed] (Goal, experience, schedule, first program selected)
      │
      ▼
[first_workout_started] (Within 72 hours of signup)
      │
      ▼
[first_set_completed] (Logged with < 2 taps)
      │
      ▼
[first_workout_completed] (Generates session grade & recap card)
      │
      ▼
[week_1_recap_viewed] (Completed 3+ planned sessions)
      │
      ▼
[week_4_active_retained] (Still completing ≥ 80% of scheduled weekly volume)
\`\`\`

#### Key Event Telemetry Schema

| Event Name | Key Properties | Purpose / Trigger |
| :--- | :--- | :--- |
| \`workout_session_started\` | \`program_id\`, \`routine_name\`, \`split_day\`, \`offline_flag\` | Measures workout start velocity from Morning Brief vs Manual. |
| \`set_logged\` | \`exercise_id\`, \`set_number\`, \`weight_kg\`, \`reps\`, \`rir\`, \`set_type\`, \`time_to_log_ms\` | **North Star:** Verifies median time to log a set is < 2.0 seconds. |
| \`exercise_swapped\` | \`original_exercise_id\`, \`replacement_exercise_id\`, \`reason\` | Tracks floor friction (e.g. bench taken) and substitution popularity. |
| \`rest_timer_completed\` | \`prescribed_seconds\`, \`actual_seconds\`, \`extended_count\` | Gauges actual recovery discipline vs planned pacing. |
| \`personal_record_detected\` | \`exercise_id\`, \`metric_type\` (1RM/Reps), \`delta_kg\` | Triggers celebration card and potential share loop. |
| \`share_card_exported\` | \`card_type\` (PR / Weekly Recap), \`destination\` (IG Story / Copy / Save) | Tracks viral loop efficiency and organic acquisition. |
| \`ai_substitution_requested\`| \`exercise_id\`, \`reason\`, \`accepted_flag\` | Monitors AI coach suggestion trust and utility rate. |`,
  },
  {
    id: 'risks',
    number: 12,
    title: 'Risks & How to Avoid Abandonment',
    summary: 'Mitigating logging friction, bad gym Wi-Fi, program confusion, and guilt cycles.',
    content: `### 12. Strategic Risks & The Anti-Abandonment Playbook

#### Risk 1: Logging Friction Fatigue (The "I'll Log It Later" Death Spiral)
* **The Failure Mode:** Entering weight, reps, RPE, rest times, and notes takes 6 taps per set. By week 3, the lifter gets lazy, skips logging set 3, stops opening the app, and reverts to Apple Notes or nothing.
* **Ironmate Countermeasure:** **Pre-filled Defaults from Previous Performance.** When Set 2 appears, it is already populated with the target weight and reps. Completing the set is a **single giant tap**. If the lifter hits target, zero keyboard interaction is required.

---

#### Risk 2: Bad Gym Wi-Fi & Basement Dead Zones
* **The Failure Mode:** The app spins a loading indicator while trying to fetch an exercise image or save a set in a basement gym with metal walls. The app freezes, sets are lost, and user trust is destroyed forever.
* **Ironmate Countermeasure:** **100% Offline-First Local Storage (WatermelonDB/SQLite).** The app reads and writes to local SQLite first. All 800+ exercise cues and muscle graphics are bundled locally or cached. Sync to Supabase happens asynchronously in the background with automatic retries.

---

#### Risk 3: The Broken Streak Guilt Trap
* **The Failure Mode:** Lifter gets the flu, travels for work, or takes an intelligent rest day. The app resets their "24-day streak" to zero. Demoralized by the arbitrary reset, they abandon the app entirely.
* **Ironmate Countermeasure:** **Intelligent Consistency Scoring.** Ironmate streaks track *planned adherence*, not consecutive daily logging. Taking a scheduled rest day or logging a deload week **strengthens** the consistency score. Streaks are never weaponized.

---

#### Risk 4: Program Rigidity vs Floor Reality
* **The Failure Mode:** App prescribes Barbell Incline Press. Every incline bench is taken for 25 minutes. Lifter is forced to abandon the workout or do unlogged exercises.
* **Ironmate Countermeasure:** **Instant 1-Tap Biomechanical Substitutes.** One tap offers Incline Dumbbell Press or Machine Incline Press, preserving identical stimulus and transferring historical load estimations seamlessly.`,
  },
];
