-- Voters Table
CREATE TABLE voters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    dob DATE,
    address TEXT,
    state TEXT,
    zone TEXT,
    district TEXT,
    polling_station TEXT,
    last_verified_year INTEGER,
    risk_score INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('Active', 'Shifted', 'Deceased', 'Not Found', 'Pending Verification', 'Duplicate')),
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reasons TEXT[] DEFAULT '{}',
    aadhaar_meta JSONB,
    other_id_meta JSONB,
    is_archived BOOLEAN DEFAULT FALSE,
    duplicate_of TEXT REFERENCES voters(id),
    flagged_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Profile Table (Optional but recommended for Clerk Sync)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- This will be the Clerk User ID
    name TEXT,
    role TEXT CHECK (role IN ('Election Officer', 'SIR Field Officer', 'Administrator', 'Municipal Corporation')),
    district TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Allow authenticated users to read and write)
-- Note: In a production app, you would refine these further based on user roles.
CREATE POLICY "Allow authenticated full access to voters" ON voters FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to audit_logs" ON audit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to profiles" ON profiles FOR ALL TO authenticated USING (true);
