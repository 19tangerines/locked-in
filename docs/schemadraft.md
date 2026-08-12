# locked.in Schema Draft

This is the minimal database structure for the first version of locked.in. Supabase Auth manages login information separately from these application tables.

## Supabase Auth (managed by Supabase)

Supabase Auth stores:

- user ID
- email address
- password hash
- Google authentication information

locked.in will not store passwords in its own tables. The User ID created by Supabase Auth is used to connect a signed-in User to their Profile and application data.

## Core Tables

### `profiles`

Stores the application settings associated with one User.

| Column | Type | Required | Description |
|---|---|---:|---|
| `user_id` | UUID | Yes | Primary key; matches the User ID in Supabase Auth |
| `display_name` | Text | Yes | Public name shown in Challenges |
| `avatar_path` | Text | No | Path to the User's profile image in Supabase Storage |
| `preferred_unit` | Text | Yes | `mi` or `km`; defaults to `mi` |
| `theme` | Text | Yes | `system`, `light`, or `dark`; defaults to `system` |
| `created_at` | Timestamp | Yes | When the Profile was created |
| `updated_at` | Timestamp | Yes | When the Profile was last changed |

Rules:

- `user_id` must reference an existing Supabase Auth User.
- A User can edit only their own Profile.
- Display names do not need to be unique.
- Email and password are not stored here.
- A list of Challenges is not stored here; it is found through `memberships`.

### `challenges`

Stores the settings and lifecycle of one Challenge.

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `name` | Text | Yes | Challenge name |
| `mode` | Text | Yes | `furthest_wins` or `group_goal` |
| `start_at` | Timestamp | Yes | When the Challenge begins |
| `end_at` | Timestamp | Yes | Final Activity-submission deadline |
| `timezone` | Text | Yes | IANA timezone captured from the creator's device, such as `America/Los_Angeles` |
| `status` | Text | Yes | `scheduled`, `active`, `awaiting_decision`, or `finalized` |
| `join_code` | Text | Yes | Unique six-character Crockford Base32 Join Code |
| `proof_required` | Boolean | Yes | Whether new Activity submissions require a proof photo; defaults to `false` |
| `max_members` | Integer | Yes | Maximum active Memberships; defaults to `100` |
| `goal_target` | Decimal | No | Final scaled-distance target for Group Goal Challenges |
| `milestone_targets` | Decimal array | Yes | Ordered intermediate Group Goal targets; defaults to an empty array |
| `created_at` | Timestamp | Yes | When the Challenge was created |
| `updated_at` | Timestamp | Yes | When the Challenge was last changed |

Rules:

- `end_at` must be later than `start_at`.
- `join_code` must be unique.
- `max_members` must be between `1` and `100`.
- `goal_target` and `milestone_targets` are used only for Group Goal Challenges.
- Each Milestone is only a number in v1. A separate Milestone table is unnecessary unless Milestones later receive labels or other data.
- Member count is calculated by counting active rows in `memberships`; it is not stored on the Challenge.
- Allowed Sports are stored in `challenge_sports`; they are not stored as a list on the Challenge.

### `memberships`

Connects one User to one Challenge and records that User's role in that Challenge.

| Column | Type | Required | Description |
|---|---|---:|---|
| `challenge_id` | UUID | Yes | References `challenges.id` |
| `user_id` | UUID | Yes | References `profiles.user_id` |
| `role` | Text | Yes | `admin` or `participant`; defaults to `participant` |
| `joined_at` | Timestamp | Yes | When the User joined the Challenge |

Primary key:

```text
(challenge_id, user_id)
```

This prevents one User from joining the same Challenge more than once.

Why this table exists:

- One User can join many Challenges.
- One Challenge can contain many Users.
- A User can be an Admin in one Challenge and a Participant in another.
- Admin is therefore a property of a Membership, not a Profile.

Deleting an active Membership also deletes that User's Activities in the associated active Challenge.

### `challenge_sports`

Stores one allowed Sport and its scoring rule for one Challenge.

| Column | Type | Required | Description |
|---|---|---:|---|
| `challenge_id` | UUID | Yes | References `challenges.id` |
| `sport` | Text | Yes | `running`, `paddling`, `swimming`, or `weightlifting` in v1 |
| `measurement_type` | Text | Yes | `distance` or `duration` |
| `scaling_factor` | Decimal | Yes | Converts a standardized value into scaled miles |

Primary key:

```text
(challenge_id, sport)
```

Default rules:

| Sport | Measurement | Scaling factor |
|---|---|---:|
| Running | Distance in miles | `1.0` |
| Paddling | Distance in miles | `1.0` |
| Swimming | Distance in miles | `3.0` |
| Weightlifting | Duration in minutes | `0.033333` |

Rules:

- `scaling_factor` must be greater than zero.
- If a Sport is not allowed in a Challenge, it has no row for that Challenge.
- A factor of zero is not used to represent a prohibited Sport.
- Admins can customize these factors for an active Challenge according to the rules in the design document.

### `activities`

Stores one workout submitted by one User to one Challenge.

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `challenge_id` | UUID | Yes | Challenge to which the Activity was submitted |
| `user_id` | UUID | Yes | User who submitted the Activity |
| `sport` | Text | Yes | Sport used for the Activity |
| `value` | Decimal | Yes | Original number entered by the User |
| `unit` | Text | Yes | `mi`, `km`, or `min` |
| `activity_date` | Date | Yes | Date on which the workout occurred |
| `proof_photo_path` | Text | No | Path to the proof image in Supabase Storage |
| `created_at` | Timestamp | Yes | When the Activity was submitted |
| `updated_at` | Timestamp | Yes | When the Activity was last edited |

Relationships:

- `(challenge_id, user_id)` must match an existing `memberships` row.
- `(challenge_id, sport)` must match an existing `challenge_sports` row.

Rules:

- `value` must be greater than zero.
- Distance Sports accept `mi` or `km`.
- Duration Sports accept `min`.
- `activity_date` must fall within the Challenge period and cannot be in the future.
- The backend checks whether a proof photo is required before accepting the Activity.
- Each Activity belongs to exactly one Challenge.
- Deleting an Activity also deletes its associated proof photo from Storage.

Only the original `value` and `unit` are stored. Standardized and scaled distances are calculated when Challenge progress is requested:

```text
original value and unit
    -> convert distance to miles when necessary
    -> apply the Challenge Sport's scaling factor
    -> scaled miles
```

For example:

```text
2 km swimming
    -> 1.242742 miles
    -> 1.242742 x 3.0
    -> 3.728226 scaled miles
```

## Relationships Summary

```text
Supabase Auth User
        |
        | one-to-one
        v
     profiles
        |
        | one User can have many Memberships
        v
   memberships >------ challenges
        |                   |
        |                   | one Challenge has many allowed Sports
        |                   v
        |             challenge_sports
        |                   |
        +------ activities -+
```

In plain language:

- One authenticated User has one Profile.
- Users and Challenges are connected through Memberships.
- Each Challenge has one row per allowed Sport.
- Each Activity belongs to one Membership and uses one allowed Challenge Sport.

## Data Not Stored Directly

The following values are calculated instead of stored:

- a Profile's list of Challenges
- a Challenge's current member count
- standardized Activity distance
- scaled Activity distance
- leaderboard totals and placements
- Group Goal progress percentages

This avoids storing duplicate values that could become inconsistent.

## Tables to Add Later

These tables are not required for the first Challenge and Activity workflow:

### `notifications`

Add when in-app notifications are implemented. One row will represent one message sent to one User.

Likely columns:

```text
id, user_id, challenge_id, type, title, body, read, created_at
```

### `final_results`

Add when Challenge finalization and account deletion are implemented. One row will preserve one Participant's frozen result in a finalized Challenge.

Likely columns:

```text
id, challenge_id, user_id (optional), display_name,
placement (optional), scaled_total, contribution_percent (optional), anonymized
```

If the User later deletes their account, `user_id` becomes empty and `display_name` becomes `Deleted User`, while the frozen score remains unchanged.
