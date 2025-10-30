-- ============================================================================
-- OneHealth Grid - Dummy Data Seeding Script
-- This script creates test data for development and demonstration
-- ============================================================================

-- First, ensure all tables exist (run 01-init-schema.sql and 02-add-user-roles.sql first)

-- ============================================================================
-- 1. Create Test Organizations
-- ============================================================================
INSERT INTO organizations (id, name, type, location, latitude, longitude, contact_email, contact_phone)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Central Hospital', 'hospital', 'New York, NY', 40.7128, -74.0060, 'admin@centralhospital.com', '+1-212-555-0001'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Riverside Veterinary Center', 'veterinary_center', 'Los Angeles, CA', 34.0522, -118.2437, 'info@riversidevetcenter.com', '+1-213-555-0002'),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'State Health Department', 'health_official', 'Chicago, IL', 41.8781, -87.6298, 'surveillance@statehealth.gov', '+1-312-555-0003'),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Metro Medical Center', 'hospital', 'Houston, TX', 29.7604, -95.3698, 'contact@metromed.com', '+1-713-555-0004'),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Wildlife Veterinary Clinic', 'veterinary_center', 'Denver, CO', 39.7392, -104.9903, 'wildlife@vetclinic.com', '+1-303-555-0005');

-- ============================================================================
-- 2. Create Test Disease Cases
-- ============================================================================
INSERT INTO disease_cases (id, organization_id, user_id, patient_age, patient_gender, disease_name, disease_category, symptoms, onset_date, report_date, status, location, latitude, longitude, notes)
VALUES
  -- Central Hospital cases
  -- Changed user_id from placeholder UUIDs to NULL to avoid foreign key constraint violations
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, 35, 'M', 'Influenza', 'Respiratory', ARRAY['fever', 'cough', 'fatigue'], '2025-10-20', '2025-10-21', 'confirmed', 'New York, NY', 40.7128, -74.0060, 'Patient hospitalized for 3 days'),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, 28, 'F', 'Influenza', 'Respiratory', ARRAY['fever', 'sore throat', 'cough'], '2025-10-21', '2025-10-22', 'confirmed', 'New York, NY', 40.7128, -74.0060, 'Close contact with case 1'),
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, 42, 'M', 'Influenza', 'Respiratory', ARRAY['fever', 'cough', 'body aches'], '2025-10-22', '2025-10-23', 'confirmed', 'New York, NY', 40.7128, -74.0060, 'Healthcare worker'),
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, 55, 'F', 'COVID-19', 'Respiratory', ARRAY['fever', 'cough', 'shortness of breath'], '2025-10-19', '2025-10-20', 'confirmed', 'New York, NY', 40.7128, -74.0060, 'Severe case, ICU admission'),
  ('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, 31, 'M', 'Measles', 'Viral', ARRAY['rash', 'fever', 'cough'], '2025-10-18', '2025-10-19', 'reported', 'New York, NY', 40.7128, -74.0060, 'Unvaccinated patient'),

  -- Riverside Veterinary Center cases
  ('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, NULL, 5, 'M', 'Canine Distemper', 'Viral', ARRAY['fever', 'cough', 'lethargy'], '2025-10-20', '2025-10-21', 'confirmed', 'Los Angeles, CA', 34.0522, -118.2437, 'Dog from local shelter'),
  ('650e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, NULL, 3, 'F', 'Canine Distemper', 'Viral', ARRAY['fever', 'nasal discharge'], '2025-10-21', '2025-10-22', 'confirmed', 'Los Angeles, CA', 34.0522, -118.2437, 'Contact with case 6'),
  ('650e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, NULL, 7, 'M', 'Feline Leukemia', 'Viral', ARRAY['lethargy', 'anorexia'], '2025-10-15', '2025-10-16', 'resolved', 'Los Angeles, CA', 34.0522, -118.2437, 'Treated successfully'),

  -- Metro Medical Center cases
  ('650e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, NULL, 45, 'M', 'Dengue Fever', 'Viral', ARRAY['fever', 'headache', 'joint pain'], '2025-10-17', '2025-10-18', 'confirmed', 'Houston, TX', 29.7604, -95.3698, 'Recent travel to endemic area'),
  ('650e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, NULL, 38, 'F', 'Dengue Fever', 'Viral', ARRAY['fever', 'rash', 'muscle pain'], '2025-10-18', '2025-10-19', 'confirmed', 'Houston, TX', 29.7604, -95.3698, 'Family member of case 9');

-- ============================================================================
-- 3. Create Test Outbreaks
-- ============================================================================
INSERT INTO outbreaks (id, disease_name, disease_category, location, latitude, longitude, case_count, severity, status, detected_date)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001'::uuid, 'Influenza', 'Respiratory', 'New York, NY', 40.7128, -74.0060, 3, 'high', 'active', NOW() - INTERVAL '5 days'),
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, 'Canine Distemper', 'Viral', 'Los Angeles, CA', 34.0522, -118.2437, 2, 'medium', 'active', NOW() - INTERVAL '2 days'),
  ('750e8400-e29b-41d4-a716-446655440003'::uuid, 'Dengue Fever', 'Viral', 'Houston, TX', 29.7604, -95.3698, 2, 'medium', 'active', NOW() - INTERVAL '3 days'),
  ('750e8400-e29b-41d4-a716-446655440004'::uuid, 'COVID-19', 'Respiratory', 'New York, NY', 40.7128, -74.0060, 1, 'low', 'contained', NOW() - INTERVAL '10 days');

-- ============================================================================
-- 4. Create Test Alerts
-- ============================================================================
INSERT INTO alerts (id, outbreak_id, organization_id, alert_type, message, is_read)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, '750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'new_outbreak', 'New Influenza outbreak detected in New York, NY with 3 confirmed cases', FALSE),
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, '750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'case_increase', 'Influenza case count increased to 3 in New York, NY', FALSE),
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, '750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'severity_change', 'Influenza outbreak severity changed to HIGH in New York, NY', TRUE),
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, '750e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'new_outbreak', 'New Canine Distemper outbreak detected in Los Angeles, CA', FALSE),
  ('850e8400-e29b-41d4-a716-446655440005'::uuid, '750e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'new_outbreak', 'New Dengue Fever outbreak detected in Houston, TX', FALSE);

-- ============================================================================
-- 5. Create Test User Roles (requires auth.users to exist)
-- ============================================================================
-- Note: These UUIDs should match actual auth.users IDs in your Supabase project
-- For testing, we'll use placeholder UUIDs that you can update after creating users

-- INSERT INTO user_roles (user_id, organization_id, role)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin'),
--   ('00000000-0000-0000-0000-000000000002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'admin'),
--   ('00000000-0000-0000-0000-000000000003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'analyst');

-- ============================================================================
-- 6. Create Test Notification Preferences
-- ============================================================================
-- INSERT INTO notification_preferences (user_id, organization_id, email_on_outbreak, email_on_case_increase, email_on_severity_change, email_digest_frequency)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, TRUE, TRUE, TRUE, 'daily'),
--   ('00000000-0000-0000-0000-000000000002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, TRUE, FALSE, TRUE, 'weekly'),
--   ('00000000-0000-0000-0000-000000000003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, TRUE, TRUE, FALSE, 'daily');

-- ============================================================================
-- 7. Create Test Analytics Snapshots
-- ============================================================================
INSERT INTO analytics_snapshots (organization_id, snapshot_date, total_cases, confirmed_cases, resolved_cases, active_outbreaks, critical_outbreaks, top_diseases)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE - INTERVAL '5 days', 2, 1, 0, 0, 0, ARRAY['COVID-19']),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE - INTERVAL '4 days', 3, 2, 0, 0, 0, ARRAY['COVID-19', 'Influenza']),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE - INTERVAL '3 days', 4, 3, 0, 1, 0, ARRAY['Influenza', 'COVID-19']),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE - INTERVAL '2 days', 5, 4, 0, 1, 0, ARRAY['Influenza', 'COVID-19', 'Measles']),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE - INTERVAL '1 day', 5, 4, 0, 1, 1, ARRAY['Influenza', 'COVID-19', 'Measles']),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, CURRENT_DATE, 5, 4, 0, 1, 1, ARRAY['Influenza', 'COVID-19', 'Measles']),
  
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, CURRENT_DATE - INTERVAL '3 days', 1, 0, 0, 0, 0, ARRAY['Canine Distemper']),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, CURRENT_DATE - INTERVAL '2 days', 2, 1, 0, 0, 0, ARRAY['Canine Distemper']),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, CURRENT_DATE - INTERVAL '1 day', 3, 2, 1, 1, 0, ARRAY['Canine Distemper', 'Feline Leukemia']),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, CURRENT_DATE, 3, 2, 1, 1, 0, ARRAY['Canine Distemper', 'Feline Leukemia']),
  
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, CURRENT_DATE - INTERVAL '3 days', 1, 0, 0, 0, 0, ARRAY['Dengue Fever']),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, CURRENT_DATE - INTERVAL '2 days', 2, 1, 0, 0, 0, ARRAY['Dengue Fever']),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, CURRENT_DATE - INTERVAL '1 day', 2, 2, 0, 1, 0, ARRAY['Dengue Fever']),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, CURRENT_DATE, 2, 2, 0, 1, 0, ARRAY['Dengue Fever']);

-- ============================================================================
-- Summary
-- ============================================================================
-- This script creates:
-- - 5 test organizations (hospitals, veterinary centers, health officials)
-- - 10 disease cases across different organizations and statuses
-- - 4 active/contained outbreaks
-- - 5 alerts for outbreak notifications
-- - 14 analytics snapshots for historical data tracking
--
-- To use this data:
-- 1. Run scripts 01-init-schema.sql and 02-add-user-roles.sql first
-- 2. Run this script (03-seed-dummy-data.sql)
-- 3. Create test users in Supabase Auth
-- 4. Update the user_roles and notification_preferences sections with actual user IDs
-- ============================================================================
