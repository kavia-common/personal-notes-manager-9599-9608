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

2. The Supabase instance must have a table named `notes` with the following fields:

- `id` (integer, primary key, auto increment)
- `title` (text)
- `content` (text)
- `updated_at` (timestamp, defaults to now())

3. The `@supabase/supabase-js` SDK is installed in package.json and dynamically imported by the app.

## Usage

- Add/Edit/Delete/Search/View notes is performed through CRUD operations on the `notes` table.
- No user authentication is implemented; all notes are public to the anon key scope.
- All data operations are in `src/App.js` via the Supabase client.
- To customize, see `src/App.js` for Supabase API usage.

## Notes

- After updating environment variables, restart the frontend dev server.
- [Supabase docs](https://supabase.com/docs)
