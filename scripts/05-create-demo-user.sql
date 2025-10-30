-- Create a demo user for prototype testing
-- This script should be run after the other initialization scripts

-- First, we need to manually insert a user into the auth.users table
-- Note: This is a simplified approach for demo purposes only
-- In production, users should be created through the Supabase authentication system

-- Insert a demo user record
-- Email: demo123@gmail.com
-- Password: 123456789 (hashed)
-- Note: In practice, you would use Supabase's auth system to create users
-- This is just for demo purposes in a prototype environment

-- For Supabase, you would typically create the user through the dashboard or API
-- But for local development, you might need to insert directly

/*
-- Example of how you might insert a user directly (THIS IS NOT RECOMMENDED FOR PRODUCTION):
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo123@gmail.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', -- Placeholder hash
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Demo User"}'::jsonb,
  NOW(),
  NOW()
);
*/

-- Instead, for a prototype, you should:
-- 1. Use the Supabase dashboard to create a user with email: demo123@gmail.com and password: 123456789
-- 2. Or use the Supabase API to create the user programmatically

-- Then assign the user to an organization
INSERT INTO user_roles (user_id, organization_id, role)
SELECT 
  u.id as user_id,
  o.id as organization_id,
  'admin' as role
FROM auth.users u, organizations o
WHERE u.email = 'demo123@gmail.com' 
AND o.name = 'Central Hospital'
ON CONFLICT DO NOTHING;

-- Set notification preferences for the demo user
INSERT INTO notification_preferences (user_id, organization_id, email_on_outbreak, email_on_case_increase, email_on_severity_change, email_digest_frequency)
SELECT 
  u.id as user_id,
  o.id as organization_id,
  TRUE as email_on_outbreak,
  TRUE as email_on_case_increase,
  TRUE as email_on_severity_change,
  'daily' as email_digest_frequency
FROM auth.users u, organizations o
WHERE u.email = 'demo123@gmail.com' 
AND o.name = 'Central Hospital'
ON CONFLICT DO NOTHING;

-- Instructions for setting up the demo user:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user"
-- 4. Enter:
--    Email: demo123@gmail.com
--    Password: 123456789
--    User metadata: {"full_name": "Demo User"}
-- 5. Click "Create user"
-- 6. Run this script to assign the user to an organization