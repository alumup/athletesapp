/*
  Migration: Create emails table
  
  Purpose: 
  - Create the emails table to track all emails sent from the application
  - Enable RLS for secure access control
  - Add appropriate indexes for performance
  
  Affected Tables: emails (new table)
  
  Special Considerations:
  - Emails are tied to accounts and recipients (people)
  - Status field tracks delivery state (sent, delivered, failed)
  - Resend ID links to external email service for tracking
*/

-- Create emails table
create table public.emails (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  account_id uuid null,
  sender text null,
  recipient_id uuid null,
  subject text null,
  content text null,
  status text not null default 'sent',
  sent_at timestamp with time zone null,
  resend_id text null,
  metadata jsonb null,
  constraint emails_account_id_fkey foreign key (account_id) references public.accounts(id) on delete cascade,
  constraint emails_recipient_id_fkey foreign key (recipient_id) references public.people(id) on delete set null
);

comment on table public.emails is 'Tracks all emails sent from the application to athletes and families. Includes delivery status and integration with Resend email service.';

-- Create indexes for better query performance
create index emails_account_id_idx on public.emails using btree (account_id);
create index emails_recipient_id_idx on public.emails using btree (recipient_id);
create index emails_created_at_idx on public.emails using btree (created_at desc);
create index emails_status_idx on public.emails using btree (status);

-- Enable Row Level Security
alter table public.emails enable row level security;

-- RLS Policy: Allow authenticated users to view emails from their account
create policy "Users can view emails from their account"
on public.emails
for select
to authenticated
using (
  account_id in (
    select account_id
    from public.profiles
    where id = (select auth.uid())
  )
);

-- RLS Policy: Allow authenticated users to insert emails for their account
create policy "Users can insert emails for their account"
on public.emails
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from public.profiles
    where id = (select auth.uid())
  )
);

-- RLS Policy: Allow authenticated users to update emails from their account
create policy "Users can update emails from their account"
on public.emails
for update
to authenticated
using (
  account_id in (
    select account_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  account_id in (
    select account_id
    from public.profiles
    where id = (select auth.uid())
  )
);

-- RLS Policy: Allow authenticated users to delete emails from their account
create policy "Users can delete emails from their account"
on public.emails
for delete
to authenticated
using (
  account_id in (
    select account_id
    from public.profiles
    where id = (select auth.uid())
  )
);

