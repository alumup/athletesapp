-- Add a sender email to your account
-- 
-- Instructions:
-- 1. Find your account_id by running: SELECT id, name FROM accounts;
-- 2. Replace 'YOUR_ACCOUNT_ID' with your actual account ID
-- 3. Replace the name and email with your desired sender details
-- 4. Run this in Supabase SQL Editor

INSERT INTO senders (account_id, name, email)
VALUES (
  'YOUR_ACCOUNT_ID',  -- Replace with your account ID
  'Your Team Name',   -- Replace with sender name
  'contact@example.com' -- Replace with sender email
);

-- Verify it was added:
SELECT * FROM senders WHERE account_id = 'YOUR_ACCOUNT_ID';

