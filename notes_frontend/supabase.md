# Supabase Integration for Notes Frontend

## Overview

This React app uses [Supabase](https://supabase.com/) for real-time data storage and synchronization of notes. 
Supabase stores all user notes in a `notes` table and the frontend interacts with it through the official Supabase JS SDK.

## Setup

1. You must set the following environment variables in your `.env` file at the root of the `notes_frontend` directory:

```
REACT_APP_SUPABASE_URL=<your-supabase-project-url>
REACT_APP_SUPABASE_KEY=<your-supabase-anon-public-key>
```

These will be used by the Supabase client in the app:
```js
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
```

2. The Supabase instance must have a table named `notes` with the following fields **(see actual deployed schema below)**:

### Frontend Code Expects:
- `id` (integer, primary key, auto increment)
- `title` (text)
- `content` (text)
- `updated_at` (timestamp, defaults to now())

### Actual Supabase Table Schema:
- `id` (uuid, primary key, defaults to uuid_generate_v4())
- `title` (text, NOT NULL)
- `body` (text)
- `category` (text)
- `created_at` (timestamp with tz, default now())
- `updated_at` (timestamp with tz, nullable)

**⚠️ WARNING:**  
The Supabase table column for note content is currently `body`, not `content`, and the id is `uuid` (not auto-increment integer).  
If your React app fails to show/add/edit notes:  
- **Change all usage of `.content` in your code to `.body`** OR  
- **Update the Supabase table schema** to match the frontend by renaming the field to `content` and making `id` an integer auto-increment primary key.

> To apply this correction via Supabase SQL:
> ```sql
> ALTER TABLE notes RENAME COLUMN body TO content;
> ALTER TABLE notes ALTER COLUMN id TYPE integer USING id::integer;
> ALTER TABLE notes ALTER COLUMN id SET DEFAULT nextval('notes_id_seq');
> ```

3. The `@supabase/supabase-js` SDK is installed in package.json and dynamically imported by the app.

## Usage

- Add/Edit/Delete/Search/View notes is performed through CRUD operations on the `notes` table.
- No user authentication is implemented; all notes are public to the anon key scope.
- All data operations are in `src/App.js` via the Supabase client.
- To customize, see `src/App.js` for Supabase API usage.

## Notes

- After updating environment variables, restart the frontend dev server.
- [Supabase docs](https://supabase.com/docs)
