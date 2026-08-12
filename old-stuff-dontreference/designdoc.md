# locked.in: competitive workout tracking 

## Intro and Overview

locked.in is a group workout tracking app that encourages building regular exercise habits and committing to health goals through timed challenges. With different game modes and support for groups up to 100 participants, this app will facilitate logging and tracking individual and group progress, as well as regular notifications and updates to keep members engaged and encourage participation. 

### Objectives:

- support groups of up to 100 participants 
- support periods up to 6 months
- provide 3 starting gamemodes, each designed for a different training philosophy
- create a smooth activity logging system to reduce user friction
- notification system to encourage engagement (regular updates, periodical leaderboard checks)

### Key Requirements:

- user account creation, deletion, modification
- challenge creation, etc.
- differentiation between admin + participant
- leaderboard/progress elements
- mobile + cross-platform compatibility
- notification system 

### Background Information:

This project was inspired by cardio challenges/workout challenges hosted by the UCSD Dragon Boat Team during school breaks. These workout challenges were previously ran through google form submissions, google sheet leaderboards, and manual verification and progress notification by team coaches. The current project scope is meant to address team-specific needs and challenges, as well as small-group personal challenges. 

## System Architecture 

![alt text](image-3.png)

### Frontend

The frontend is the point of contact to users. HTML/CSS/JS with custom forms following a modern and athletic theme. Includes the display for login, account management, dashboard display, joining/creating challenges, challenge dashboard, and adding/editing/deleting activities. 

### Mini Backend

Not really heavy computing here. This will handle passing requests to Supabase for authentication, creating/editing/deleting challenges/account details/activities, as well as getting the related entries from Supabase and completing any neccesary calculations to display them on the frontend. Primarily TS/Node, since we won't need much complex computing for now. 

Most CRUD operations can go through the Supabase client SDK directly (protected by Row Level Security policies on each table). A lightweight server layer (or Supabase Edge Functions) is needed only for operations that require trusted server-side logic:

- **Join code generation** — generate unique 6-character alphanumeric codes, checking for collisions
- **Leaderboard calculations** — aggregations across users for ranking, particularly for streak and cumulative goal modes
- **Notifications dispatch** — scheduling and sending push/email notifications on challenge events

### Supabase

Supabase will handle authentication and data storage. Uses a postgreSQL, which will allow for different tables to store different sets of data (users, challenges, activities), as well as connect them with relational ids. Also handles authentication through email/password pairs as well as google auth, keeping everything neatly in one place (will not need complex authentication methods for this).

**Storage:** Supabase Storage will be used for proof photos (one bucket: `proof-photos`) and user avatars (`avatars`). Photos are uploaded directly from the frontend using signed upload URLs; RLS policies restrict access so only challenge members can view proof photos within their challenge.

### Database Schema

```sql
-- extends supabase auth.users with app-specific profile data
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url  text,                          -- path in 'avatars' storage bucket
  preferred_unit text default 'km',          -- 'km' | 'mi'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table challenges (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null,              -- 'furthest_distance' | 'cumulative_goal' | 'bingo'
  allowed_sports  text[] not null default '{}', -- e.g. {'running','rowing','cycling'}; ignored for bingo
  start_date      date not null,
  end_date        date not null,
  proof_required  boolean default false,
  join_code       text unique not null,       -- 6-char alphanumeric, uppercase
  cumulative_target_km numeric,              -- only used when type = 'cumulative_goal'
  scaling_overrides jsonb,                    -- per-challenge overrides to global defaults; null = use globals
  max_participants int default 100,
  created_by      uuid not null references profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  constraint valid_dates check (end_date > start_date),
  constraint valid_type check (type in ('furthest_distance', 'cumulative_goal', 'bingo'))
);

create table challenge_members (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references challenges(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  role          text not null default 'participant', -- 'admin' | 'participant'
  joined_at     timestamptz default now(),
  left_at       timestamptz,                 -- null = still active
  keep_data     boolean default true,        -- whether to preserve entries on leave
  unique(challenge_id, user_id)
);

create table activities (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references challenges(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  sport           text not null,              -- must be in challenge's allowed_sports
  raw_value       numeric not null,           -- distance in km, or duration in minutes for scaled sports
  raw_unit        text not null default 'km', -- 'km' | 'min'
  scaled_km       numeric not null,           -- after applying scaling factor (= raw_value if km, or raw_value * factor if min)
  activity_date   date not null,
  proof_photo_url text,                       -- path in 'proof-photos' storage bucket
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- bingo mode: auto-generated or admin-created mini challenges
create table bingo_squares (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references challenges(id) on delete cascade,
  prompt        text not null,                -- e.g. "Do push-ups in public", "Run with a funny hat"
  points        int default 1,                -- how much clearing this square is worth
  position      int,                          -- grid position (for bingo card layout)
  created_at    timestamptz default now()
);

create table bingo_completions (
  id            uuid primary key default gen_random_uuid(),
  square_id     uuid not null references bingo_squares(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  proof_photo_url text,
  completed_at  timestamptz default now(),
  unique(square_id, user_id)                  -- each user can only clear a square once
);

create table notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  type          text not null,                -- 'challenge_ending' | 'position_change' | 'new_member' | 'challenge_invite' | 'bingo_cleared'
  challenge_id  uuid references challenges(id) on delete set null,
  title         text not null,
  body          text,
  read          boolean default false,
  created_at    timestamptz default now()
);

-- global scaling defaults: how non-km activities convert to km-equivalent
-- admins can override these per-challenge via challenges.scaling_overrides
create table scaling_defaults (
  sport         text primary key,             -- e.g. 'swimming', 'weightlifting', 'cycling'
  unit          text not null,                -- 'min' | 'km'
  factor        numeric not null,             -- multiplier to convert to km-equivalent (e.g. 1 min swimming -> 0.1 km)
  label         text                          -- display label, e.g. "1 min ≈ 0.1 km"
);

-- seed with reasonable defaults
insert into scaling_defaults (sport, unit, factor, label) values
  ('running',       'km',  1.0,   null),
  ('rowing',        'km',  1.0,   null),
  ('cycling',       'km',  0.33,  '3 km cycling ≈ 1 km running'),
  ('walking',       'km',  1.0,   null),
  ('swimming',      'min', 0.1,   '10 min ≈ 1 km'),
  ('hiking',        'km',  1.0,   null),
  ('weightlifting', 'min', 0.05,  '20 min ≈ 1 km');

-- indexes for common query patterns
create index idx_activities_challenge on activities(challenge_id, user_id);
create index idx_activities_date on activities(challenge_id, activity_date desc);
create index idx_challenge_members_user on challenge_members(user_id) where left_at is null;
create index idx_challenges_join_code on challenges(join_code);
create index idx_notifications_user on notifications(user_id, read, created_at desc);
create index idx_bingo_squares_challenge on bingo_squares(challenge_id);
create index idx_bingo_completions_square on bingo_completions(square_id, user_id);
```

### API Endpoints

Most reads and simple writes go through the Supabase JS client directly (protected by RLS). The following are the logical operations grouped by component, noting which ones need Edge Functions.

#### Auth (Supabase Auth SDK)

| Operation | Method | Notes |
|---|---|---|
| Sign up (email/password) | `supabase.auth.signUp()` | triggers profile row creation via DB trigger |
| Sign in (email/password) | `supabase.auth.signInWithPassword()` | |
| Sign in (Google OAuth) | `supabase.auth.signInWithOAuth()` | |
| Sign out | `supabase.auth.signOut()` | |
| Reset password | `supabase.auth.resetPasswordForEmail()` | |

#### Profiles (Supabase client, RLS)

| Operation | Method | Path/Table | Notes |
|---|---|---|---|
| Get own profile | GET | `profiles` | filtered by `auth.uid()` |
| Update display name / avatar / unit | PATCH | `profiles` | user can only update own row |
| Upload avatar | POST | Storage `avatars/{user_id}` | |

#### Challenges

| Operation | Method | Path/Table | Notes |
|---|---|---|---|
| Create challenge | **Edge Function** | `POST /challenges` | generates join code, inserts challenge + creator as admin member |
| Get challenge by ID | GET | `challenges` + `challenge_members` | RLS: must be a member |
| Get my challenges | GET | `challenge_members` join `challenges` | filtered by `auth.uid()`, partitioned by active/ended |
| Update challenge settings | PATCH | `challenges` | RLS: must be admin |
| Join by code | **Edge Function** | `POST /challenges/join` | looks up code, validates participant cap, inserts member |
| Leave challenge | PATCH | `challenge_members` | sets `left_at`, respects `keep_data` flag |
| Delete challenge | DELETE | `challenges` | RLS: must be creator; cascades members + activities |

#### Activities

| Operation | Method | Path/Table | Notes |
|---|---|---|---|
| Log activity | POST | `activities` | validates sport is in `allowed_sports`; enforces `proof_required`; computes `scaled_km` from `raw_value` + challenge's `scaling_factors` |
| Edit activity | PATCH | `activities` | RLS: must be activity owner |
| Delete activity | DELETE | `activities` | RLS: must be activity owner or challenge admin |
| Get challenge feed | GET | `activities` | filtered by `challenge_id`, ordered by `created_at desc`, paginated |
| Get my entries | GET | `activities` | filtered by `challenge_id` + `auth.uid()` |
| Upload proof photo | POST | Storage `proof-photos/{challenge_id}/{activity_id}` | returns path stored in activity row |

#### Leaderboard (Edge Function or DB view)

| Operation | Method | Path | Notes |
|---|---|---|---|
| Get leaderboard | `GET /challenges/{id}/leaderboard` | | returns ranked list; uses `challenge_leaderboard` view for distance modes, `bingo_leaderboard` view for bingo |
| Get user position | `GET /challenges/{id}/leaderboard/me` | | returns own rank + gap to next rank |

#### Bingo (for bingo-mode challenges)

| Operation | Method | Path/Table | Notes |
|---|---|---|---|
| Generate bingo board | **Edge Function** | `POST /challenges/{id}/bingo/generate` | auto-generates squares from a prompt pool; or admin creates manually |
| Get bingo board | GET | `bingo_squares` + `bingo_completions` | returns grid with completion status per user |
| Complete a square | POST | `bingo_completions` | validates square belongs to challenge, user is member; enforces proof if required |
| Undo completion | DELETE | `bingo_completions` | RLS: must be own completion or challenge admin |

Could also be implemented as Postgres views. One for distance-based modes (furthest distance / cumulative goal), one for bingo:

```sql
-- leaderboard for furthest_distance and cumulative_goal modes
-- uses scaled_km so swimming minutes and cycling are comparable to running km
create view challenge_leaderboard as
select
  a.challenge_id,
  a.user_id,
  p.display_name,
  p.avatar_url,
  sum(a.scaled_km) as total_km,
  rank() over (
    partition by a.challenge_id
    order by sum(a.scaled_km) desc
  ) as rank
from activities a
join profiles p on p.id = a.user_id
join challenge_members cm on cm.challenge_id = a.challenge_id
  and cm.user_id = a.user_id
  and cm.left_at is null
group by a.challenge_id, a.user_id, p.display_name, p.avatar_url;

-- leaderboard for bingo mode (total points from cleared squares)
create view bingo_leaderboard as
select
  bs.challenge_id,
  bc.user_id,
  p.display_name,
  p.avatar_url,
  count(bc.id) as squares_cleared,
  coalesce(sum(bs.points), 0) as total_points,
  rank() over (
    partition by bs.challenge_id
    order by coalesce(sum(bs.points), 0) desc
  ) as rank
from bingo_completions bc
join bingo_squares bs on bs.id = bc.square_id
join profiles p on p.id = bc.user_id
group by bs.challenge_id, bc.user_id, p.display_name, p.avatar_url;
```

#### Notifications

| Operation | Method | Path/Table | Notes |
|---|---|---|---|
| Get my notifications | GET | `notifications` | filtered by `auth.uid()`, ordered by `created_at desc` |
| Mark as read | PATCH | `notifications` | sets `read = true` |
| Mark all read | PATCH | `notifications` | bulk update for user |

## Components

### Authentication 

Authentication handles communication with Supabase to manage logging in, out, and password/username/email related activities. 

**In:** email + password 

**Out:** correct match (login) or failed (try again) or account created (connects to user management)

### User Management

User management handles information related to user accounts. This includes display names, profile photo, preferred units/display colors, settings, active/past challenges, etc. 

**In:** display name (allow duplicates), photo, challenge ids, etc. 

**Out:** displays them on leaderboards, logs, UI, etc. 

### Challenge Management

Challenge management handles information related to creating, modifying, and deleting challenges. It keeps track of the challenge rules, specifications, settings, participants, admins, time period, etc. 

**In:** challenge join code (to join), new challenge settings (setup)

**Out:** challenge id, challenge information (for display, calculations, etc).

| Challenge Name | Principle | Description |
| Furthest Distance | Competition | individual progress, placement ranking |
| Cumulative Goal | Collaboration | everyone contributes towards a common total |
| Bingo/Games (tentative) | Entertainment/Games | mini challenges are auto generated (do push ups in public, run with a funny hat on, etc) and players try to clear as many as they can | 

### Activity Logging

Activity logging handles actions related to activities (lol). This involves things like adding activities, editing, and deleting them. 

**In:** distance, sport, photo, date

**Out:** activity id in supabase, saved into database

#### Activity Scaling

Users can log activities like swimming, cycling, and weightlifting using their natural units (minutes or km). These are converted to a km-equivalent using scaling factors so all activities are comparable on the leaderboard.

| Sport | Input unit | Factor | Equivalent |
|---|---|---|---|
| Running | km | 1.0 | 1:1 |
| Rowing | km | 1.0 | 1:1 |
| Walking | km | 1.0 | 1:1 |
| Hiking | km | 1.0 | 1:1 |
| Cycling | km | 0.33 | 3 km cycling ≈ 1 km |
| Swimming | min | 0.1 | 10 min ≈ 1 km |
| Weightlifting | min | 0.05 | 20 min ≈ 1 km |

Challenge admins can override any of these per-challenge (stored in `challenges.scaling_overrides`). If an admin changes a factor mid-challenge, existing entries are recalculated.

### Leaderboard & Analytics

Leaderboard & Analytics is related to calculating and displaying individual and team progress within challenges (and on the main dash). This is related to calculating total distance, adjusting relative progress, etc. 

**In:** challenge type + rules (from challenge management)

**Out:** display leaderboard, calculate placements, etc.

### Notifications

Notifications handles activities related to notifying users to join, participate in, and other updates related to their activities, including tracking which notifications should be sent and which channels to send information through. 

**Trigger events:**

| Event | When | Who gets notified |
|---|---|---|
| `challenge_invite` | Someone shares a join code/link | Recipient (if sent via in-app invite) |
| `challenge_starting` | Challenge start date arrives | All members |
| `challenge_ending` | 3 days / 1 day / final hours before end | All members |
| `new_member` | Someone joins the challenge | All existing members |
| `position_change` | A member's rank changes (up or down) | The affected member |
| `new_activity` | Someone logs an entry | Configurable: all members or off |

**Channels:** In-app notifications (stored in `notifications` table, displayed in a notification tray on the dashboard). Push notifications (future, via web push or a service like OneSignal) and email digests (future) can be layered on later using the same event triggers.

**In:** event type, challenge context, target user(s)

**Out:** notification records in the database, displayed in-app; future: push/email delivery

## User Interface Design

### User Flow Diagram 

![alt text](image.png)

Typical user would create account/login -> join or create challenge -> settings, etc -> add activity -> edit or delete if wanted -> view leaderboard 

create challenge -> select type -> set rules/modifiers -> invite people 

### Mockups

**main dashboard:**

![alt text](image-1.png)

key elements:

- greeting
- highlighted events (to encourage participation, quick checks)
- current challenges
- past challenges 

**activity dash:**

![alt text](image-2.png)

key elements:

- leaderboard with headshots (playful, allows more personality)
- compare progress with distance bars (or different for different gamemodes)
- activities feed (simple, keeps accountability)
- add activity floating element

### Design Notes

modern, clean lines, simple design, bold colors (pulling from Nike After Dark and Strava inspiration). straightforward user experience (minimize friction)

lightboxes for joining/editing/adding things. encouraging leaderboard engagement through 

## Dependencies 

Due to using SupaBase for both user authenticiation and data storage, this project has certain limitations related to the service, particularly using the free tier. The biggest concern is data storage, as activities theoretically need to be saved for long periods of time, leading to an accumulation of many entries. Additionally, if SupaBase services go down, this software's login and activity logging system will also be unavailable. 