# LAUTECH Market Backend Setup (Supabase)

To finish the referral system and waitlist, follow these two steps:

### 1. Create the Database Table
Go to your **Supabase Dashboard > SQL Editor** and run this code:

```sql
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text unique not null,
  phone_number text unique not null,
  role text not null check (role in ('buyer', 'seller', 'service provider')),
  referral_code text unique not null,
  referred_by text references waitlist(referral_code),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for fast status checks
create index waitlist_phone_idx on waitlist (phone_number);
create index waitlist_code_idx on waitlist (referral_code);
```

### 2. Add Environment Variables
Create a file named `.env` in this directory and copy your Supabase credentials into it (from the .env.example).

### 3. Vercel Deployment
Simply connect this repo to Vercel. Make sure to add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the **Environment Variables** in the Vercel dashboard.

---
The UI is now fully integrated with these features!
