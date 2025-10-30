-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'veterinary_center', 'health_official')),
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disease_cases table
CREATE TABLE disease_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Changed to allow NULL values
  patient_age INTEGER,
  patient_gender TEXT CHECK (patient_gender IN ('M', 'F', 'Other')),
  disease_name TEXT NOT NULL,
  disease_category TEXT NOT NULL,
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  onset_date DATE NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'confirmed', 'resolved')),
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outbreaks table
CREATE TABLE outbreaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name TEXT NOT NULL,
  disease_category TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  case_count INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'contained', 'resolved')),
  detected_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbreak_id UUID NOT NULL REFERENCES outbreaks(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('new_outbreak', 'case_increase', 'severity_change')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Organizations RLS Policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disease_cases dc
      WHERE dc.organization_id = organizations.id
      AND dc.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM alerts a
      WHERE a.organization_id = organizations.id
      AND a.organization_id IN (
        SELECT organization_id FROM disease_cases WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their organization" ON organizations
  FOR INSERT WITH CHECK (TRUE);

-- Disease Cases RLS Policies
CREATE POLICY "Users can view their own cases" ON disease_cases
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own cases" ON disease_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own cases" ON disease_cases
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own cases" ON disease_cases
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Outbreaks RLS Policies (public read, admin write)
CREATE POLICY "Anyone can view outbreaks" ON outbreaks
  FOR SELECT USING (TRUE);

-- Alerts RLS Policies
CREATE POLICY "Users can view alerts for their organization" ON alerts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM disease_cases WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_disease_cases_organization_id ON disease_cases(organization_id);
CREATE INDEX idx_disease_cases_user_id ON disease_cases(user_id);
CREATE INDEX idx_disease_cases_onset_date ON disease_cases(onset_date);
CREATE INDEX idx_outbreaks_disease_name ON outbreaks(disease_name);
CREATE INDEX idx_outbreaks_location ON outbreaks(location);
CREATE INDEX idx_alerts_organization_id ON alerts(organization_id);
