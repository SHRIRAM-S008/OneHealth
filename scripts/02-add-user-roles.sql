-- Create user_roles table for role-based access control
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'data_entry', 'analyst', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_on_outbreak BOOLEAN DEFAULT TRUE,
  email_on_case_increase BOOLEAN DEFAULT TRUE,
  email_on_severity_change BOOLEAN DEFAULT TRUE,
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('daily', 'weekly', 'never')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Create analytics_snapshots table for historical data
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_cases INTEGER DEFAULT 0,
  confirmed_cases INTEGER DEFAULT 0,
  resolved_cases INTEGER DEFAULT 0,
  active_outbreaks INTEGER DEFAULT 0,
  critical_outbreaks INTEGER DEFAULT 0,
  top_diseases TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, snapshot_date)
);

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.organization_id = user_roles.organization_id
    )
  );

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view analytics for their organization" ON analytics_snapshots
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM disease_cases WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_analytics_snapshots_organization_id ON analytics_snapshots(organization_id);
CREATE INDEX idx_analytics_snapshots_snapshot_date ON analytics_snapshots(snapshot_date);
