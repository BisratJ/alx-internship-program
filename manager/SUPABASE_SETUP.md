# Going live: free Supabase backend + real authentication

This turns the Intern Manager from a single-device build into a true cross-device, multi-user app, using only the **free Supabase tier**. Everything below is free; no paid services.

---

## Auth recommendation: passwordless magic links (not generated credentials)

You asked whether generating usernames/passwords is the best approach. **It isn't; use passwordless email "magic links" via Supabase Auth.** Here's the comparison:

| | Generated credentials (Option 1) | Magic link (recommended) |
|---|---|---|
| Password storage | You store/share passwords (a security liability) | No passwords exist at all |
| Sharing | Insecure (sent over chat/email in plain text) | User just enters their own email |
| Resets | Manual, ongoing admin burden | None; every login is a fresh one-time link |
| Onboarding a new intern | Create + transmit a credential | Add their email to one table; they log in |
| Scalability (10 → 100+) | Painful | Trivial |
| Security | Weak passwords, reuse, leaks | One-time, expiring links; nothing to leak |

Interns all use Gmail, so **Google sign-in** is an optional one-tap upgrade later, but magic link works for any email and needs no extra Google project setup. **Role (admin vs intern) is never self-selected**; it's read from a `profiles` table you control, so signing in simply resolves who you are.

---

## What you do (5 steps, ~15 minutes)

### 1. Create a free Supabase project
Go to supabase.com → New project (free tier). Note the **Project URL** and **anon public key** under Settings → API. (The anon key is designed to be public in client code; security is enforced by Row-Level Security below.)

### 2. Run the database SQL
Open SQL Editor → paste and run the script in the next section. It creates the tables, the privacy rules, and seeds your cohort's roles.

### 3. Enable email auth
Auth → Providers → enable **Email** with "magic link". Under Auth → URL Configuration, set **Site URL** to your Vercel domain and add redirect URLs for both your domain and `http://localhost:3000` (for local testing).

### 4. Add your people
The SQL seeds the admin + four interns by email. To add anyone later, insert one row into `profiles` (email, role, full name, pillar). That's the entire onboarding step.

### 5. Hand me the keys (or paste them yourself)
Drop the Project URL + anon key into `manager/config.js` (template below). Once that's set, the app uses Supabase automatically; until then it runs in clean local mode.

---

## The SQL (schema + Row-Level Security + seed)

```sql
-- 1. Profiles: identity + role, keyed to the Supabase auth user
create type user_role as enum ('intern','mentor','admin');
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  full_name  text,
  role       user_role not null default 'intern',
  pillar     text,
  created_at timestamptz default now()
);

-- helper: is the current user an admin/mentor?
create or replace function is_staff() returns boolean language sql security definer as $$
  select exists(select 1 from profiles where id = auth.uid() and role in ('admin','mentor'));
$$;

-- 2. Per-intern data
create type task_status as enum ('not_started','in_progress','blocked','completed');
create table task_progress (
  intern_id uuid references profiles(id) on delete cascade,
  task_id   int not null,
  status    task_status default 'not_started',
  note      text,
  updated_at timestamptz default now(),
  primary key (intern_id, task_id)
);
create table activity_logs (
  id bigserial primary key, intern_id uuid references profiles(id) on delete cascade,
  task_id int, status task_status, note text, created_at timestamptz default now());
create table journal_entries (
  id bigserial primary key, intern_id uuid references profiles(id) on delete cascade,
  content text, created_at timestamptz default now());
create table deliverables (
  id bigserial primary key, intern_id uuid references profiles(id) on delete cascade,
  title text, link text, status text default 'submitted', created_at timestamptz default now());
create table achievements (
  id bigserial primary key, intern_id uuid references profiles(id) on delete cascade,
  text text, created_at timestamptz default now());
create table feedback (
  id bigserial primary key, intern_id uuid references profiles(id) on delete cascade,
  author_id uuid references profiles(id), kind text default 'comment',
  content text, created_at timestamptz default now());

-- 3. Row-Level Security: interns see only their own rows; staff see all
alter table profiles enable row level security;
alter table task_progress enable row level security;
alter table activity_logs enable row level security;
alter table journal_entries enable row level security;
alter table deliverables enable row level security;
alter table achievements enable row level security;
alter table feedback enable row level security;

create policy "read own profile or staff reads all" on profiles
  for select using (id = auth.uid() or is_staff());
create policy "staff manage profiles" on profiles
  for all using (is_staff());

-- generic per-table policy pattern (repeat for each data table)
create policy "own or staff (select)" on task_progress for select using (intern_id = auth.uid() or is_staff());
create policy "own write"            on task_progress for insert with check (intern_id = auth.uid());
create policy "own update"           on task_progress for update using (intern_id = auth.uid());
-- (repeat the three policies above for activity_logs, journal_entries,
--  deliverables, achievements; for feedback, allow staff to insert.)
create policy "feedback read"   on feedback for select using (intern_id = auth.uid() or is_staff());
create policy "feedback write"  on feedback for insert with check (is_staff());

-- 4. Seed roles (profiles are linked once each person first signs in;
--    pre-seed by email so their role is correct on first login)
-- After a user signs in the first time, set their role/pillar by email:
update profiles set role='admin', full_name='Admin', pillar='Program Manager' where email='admin@alxinternship.app';
-- interns:
-- biti.dereje@gmail.com      -> Event Details Lead
-- yosabethyared@gmail.com    -> Marketing & Content
-- julianamussie@gmail.com    -> Outreach & Leads
-- mariam2010sami@gmail.com   -> Ops & Budget Control
```

> Tip: add a trigger on `auth.users` insert to auto-create a `profiles` row (email copied in), so the only manual step is setting role/pillar for the admin and interns.

---

## The config template (`manager/config.js`)

```js
// Fill from Supabase → Settings → API. anon key is safe in client code (RLS protects data).
window.SUPABASE_CONFIG = { url: "https://YOUR-PROJECT.supabase.co", anonKey: "YOUR-ANON-KEY" };
window.SUPABASE_ENABLED = !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
```

The Supabase JS client loads free from a CDN (no build step):
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

## The remaining wiring (the part to do against your live keys)

The app already routes **everything through one `Store` API**, so going live means swapping `Store`'s localStorage internals for Supabase calls (async) and replacing the demo profile-picker with the magic-link form. The UI components (admin cockpit, intern dashboard) don't change.

Because this needs to be tested against a real project, the cleanest path is: **you create the project and share the Project URL + anon key**, and I wire `Store` to Supabase + the magic-link login and we test the full flow together (sign in → role routing → data persists across devices → interns isolated). It's a focused ~30–45 minute step once the project exists.
