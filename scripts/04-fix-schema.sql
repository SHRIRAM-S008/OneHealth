-- Make user_id nullable in disease_cases since we're seeding with test data
ALTER TABLE disease_cases 
ALTER COLUMN user_id DROP NOT NULL;

-- Update existing records to have NULL user_id if they reference non-existent users
UPDATE disease_cases SET user_id = NULL 
WHERE user_id NOT IN (SELECT id FROM auth.users);
