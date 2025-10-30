# Remove User Role Restrictions

This document explains how to remove user role restrictions to make the OneHealth Grid system publicly accessible.

## Overview

The OneHealth Grid system currently implements Row Level Security (RLS) to restrict access based on user roles. To make the system accessible to everyone without authentication, you need to either:

1. Disable RLS on all tables (recommended approach)
2. Create permissive policies that allow public access

## Option 1: Disable RLS Completely (Recommended)

Run the following SQL commands in your Supabase SQL editor:

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

This approach completely removes all access restrictions, making all data publicly readable and writable.

## Option 2: Create Permissive Policies

If you prefer to keep RLS enabled but allow public access, create permissive policies:

```sql
-- Organizations - Allow anyone to view and insert
CREATE POLICY "Public read access" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON organizations FOR INSERT WITH CHECK (true);

-- Disease Cases - Allow anyone to view, insert, update, and delete
CREATE POLICY "Public read access" ON disease_cases FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON disease_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON disease_cases FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON disease_cases FOR DELETE USING (true);

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

## Update Middleware (Already Done)

The middleware has already been updated to allow public access to all routes. The [middleware.ts](file:///Users/shriram/Downloads/onehealth-grid/middleware.ts) file no longer enforces authentication requirements.

## Important Security Considerations

⚠️ **Warning**: Removing user role restrictions will make all data in your system publicly accessible. This includes:

- All disease cases
- All organizations
- All user roles and preferences
- All alerts and outbreak information

Only implement these changes in a development or demonstration environment. For production use, implement proper authentication and authorization controls.

## Testing the Changes

After implementing either option:

1. Navigate to your application
2. You should be able to access all pages without logging in
3. You should be able to view and modify all data

## Reverting the Changes

To restore user role restrictions, you can either:

1. Re-enable RLS and recreate the original policies
2. Restore your database from a backup

To re-enable RLS:
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;
-- ... repeat for all other tables
```

Then recreate the original policies from the [01-init-schema.sql](file:///Users/shriram/Downloads/onehealth-grid/scripts/01-init-schema.sql) and [02-add-user-roles.sql](file:///Users/shriram/Downloads/onehealth-grid/scripts/02-add-user-roles.sql) scripts.