# Public Access Setup

This document explains how to make the OneHealth Grid system publicly accessible by disabling Row Level Security (RLS).

## Overview

The OneHealth Grid system currently implements Row Level Security (RLS) to restrict access based on user roles. To make the system accessible to everyone without authentication, you need to disable RLS on all tables.

## SQL Commands

Run the following SQL commands in your Supabase SQL editor to disable RLS:

```sql
-- Disable Row Level Security for all tables to allow public access
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE outbreaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots DISABLE ROW LEVEL SECURITY;
```

## Alternative: Permissive Policies

If you prefer to keep RLS enabled but allow public access, you can create permissive policies instead:

```sql
-- Organizations - Allow anyone to view and insert
CREATE POLICY "Public read access" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON organizations FOR INSERT WITH CHECK (true);

-- Disease Cases - Allow anyone to view, insert, update, and delete
CREATE POLICY "Public read access" ON disease_cases FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON disease_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON disease_cases FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON disease_cases FOR DELETE USING (true);

-- Outbreaks - Allow anyone to view
CREATE POLICY "Public read access" ON outbreaks FOR SELECT USING (true);

-- Alerts - Allow anyone to view
CREATE POLICY "Public read access" ON alerts FOR SELECT USING (true);

-- User Roles - Allow anyone to view and manage
CREATE POLICY "Public read access" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Public all access" ON user_roles FOR ALL USING (true);

-- Notification Preferences - Allow anyone to view, insert, and update
CREATE POLICY "Public read access" ON notification_preferences FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON notification_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON notification_preferences FOR UPDATE USING (true);

-- Analytics Snapshots - Allow anyone to view
CREATE POLICY "Public read access" ON analytics_snapshots FOR SELECT USING (true);
```

## Important Notes

1. These commands should only be run in development or demonstration environments
2. Running these commands in production will make all data publicly accessible
3. Make sure to backup your database before making these changes