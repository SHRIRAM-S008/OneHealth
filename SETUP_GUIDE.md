# OneHealth Grid - Setup Guide

## Database Setup Instructions

### Step 1: Run Initial Schema Migration
Execute the first migration script to create the base tables:
\`\`\`
scripts/01-init-schema.sql
\`\`\`

This creates:
- `organizations` - Hospital, veterinary center, and health official records
- `disease_cases` - Individual disease case reports
- `outbreaks` - Detected disease outbreaks
- `alerts` - Outbreak notifications and alerts

### Step 2: Run User Roles Migration
Execute the second migration script to add user management:
\`\`\`
scripts/02-add-user-roles.sql
\`\`\`

This creates:
- `user_roles` - Role-based access control (admin, data_entry, analyst, viewer)
- `notification_preferences` - Email notification settings
- `analytics_snapshots` - Historical analytics data

### Step 3: Seed Dummy Data
Execute the seeding script to populate test data:
\`\`\`
scripts/03-seed-dummy-data.sql
\`\`\`

This creates:
- **5 test organizations** across different locations and types
- **10 disease cases** with various statuses (reported, confirmed, resolved)
- **4 active outbreaks** with different severity levels
- **5 outbreak alerts** for testing notifications
- **14 analytics snapshots** for historical trend analysis

### Step 4: Create Test Users in Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Create test users with these emails:
   - `admin@centralhospital.com` (for Central Hospital)
   - `data@riversidevetcenter.com` (for Riverside Veterinary Center)
   - `analyst@metromed.com` (for Metro Medical Center)

### Step 5: Link Users to Organizations (Optional)

After creating users, you can link them to organizations by updating the user_roles table:

\`\`\`sql
INSERT INTO user_roles (user_id, organization_id, role)
VALUES
  ('USER_ID_HERE'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin'),
  ('USER_ID_HERE'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'admin'),
  ('USER_ID_HERE'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'analyst');
\`\`\`

Replace `USER_ID_HERE` with actual user IDs from Supabase Auth.

## Testing the Platform

### 1. Login
- Use one of the test user emails created in Step 4
- You'll be redirected to set up your organization profile

### 2. View Dashboard
- See real-time statistics with the dummy data
- View active outbreaks and alerts
- Check disease distribution charts

### 3. Explore Cases
- Go to **Cases** page to view all disease cases
- Filter by status, disease category, or date range
- Click on cases to view detailed information

### 4. Check Outbreaks
- Go to **Outbreaks** page to see detected outbreaks
- View outbreak severity and case counts
- Review outbreak alerts

### 5. View Analytics
- Go to **Analytics** page for comprehensive insights
- See disease trends over time
- Export data to CSV

### 6. Test Notifications
- Go to **Settings** to configure email preferences
- Enable/disable notifications for different alert types
- Set email digest frequency

### 7. Manage Users (Admin Only)
- Go to **Users** page to invite team members
- Assign roles (admin, data_entry, analyst, viewer)
- Manage user permissions

## Test Data Overview

### Organizations
1. **Central Hospital** - New York, NY (Hospital)
2. **Riverside Veterinary Center** - Los Angeles, CA (Veterinary)
3. **State Health Department** - Chicago, IL (Health Official)
4. **Metro Medical Center** - Houston, TX (Hospital)
5. **Wildlife Veterinary Clinic** - Denver, CO (Veterinary)

### Active Outbreaks
1. **Influenza** - New York, NY (3 cases, HIGH severity)
2. **Canine Distemper** - Los Angeles, CA (2 cases, MEDIUM severity)
3. **Dengue Fever** - Houston, TX (2 cases, MEDIUM severity)
4. **COVID-19** - New York, NY (1 case, CONTAINED)

### Disease Cases
- 5 cases at Central Hospital (Influenza, COVID-19, Measles)
- 3 cases at Riverside Veterinary Center (Canine Distemper, Feline Leukemia)
- 2 cases at Metro Medical Center (Dengue Fever)

## Troubleshooting

### Issue: "Permission denied" errors
**Solution**: Ensure Row Level Security (RLS) policies are properly enabled. Check that the user is linked to an organization in the `user_roles` table.

### Issue: No data showing in dashboard
**Solution**: 
1. Verify the seeding script ran successfully
2. Check that you're logged in with a user linked to an organization
3. Ensure the user has the correct role assigned

### Issue: Outbreaks not detected
**Solution**: The outbreak detection algorithm requires 3+ cases of the same disease in the same location within 30 days. The dummy data includes pre-created outbreaks for testing.

## Next Steps

1. **Customize Organizations**: Update organization details to match your actual facilities
2. **Add Real Data**: Upload actual disease case data via the Upload page
3. **Configure Notifications**: Set up email notifications for your team
4. **Invite Team Members**: Add real users and assign appropriate roles
5. **Deploy to Production**: Use the Publish button to deploy to Vercel

## Support

For issues or questions, refer to the API Documentation page in the dashboard or contact your system administrator.
