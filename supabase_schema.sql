-- NexStaff Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'employee',
    avatar_url TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::JSONB,
    CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." 
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." 
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Departments Table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Positions Table
CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    level TEXT NOT NULL,
    salary_range JSONB,
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Jobs Table
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    employer_id UUID,
    department TEXT,
    location TEXT,
    type TEXT NOT NULL,
    category TEXT,
    salary TEXT,
    description TEXT,
    requirements JSONB DEFAULT '[]'::JSONB,
    benefits JSONB DEFAULT '[]'::JSONB,
    posted_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active',
    applications_count INTEGER DEFAULT 0,
    urgency TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates Table
CREATE TABLE candidates (    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    skills JSONB DEFAULT '[]'::JSONB,
    experience TEXT,
    preferred_role TEXT,
    current_position TEXT, -- Changed from current_role to avoid SQL keyword conflicts
    education TEXT,
    status TEXT DEFAULT 'Available',
    resume_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    registered_date DATE DEFAULT CURRENT_DATE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    applied_jobs JSONB DEFAULT '[]'::JSONB,
    interviews_scheduled INTEGER DEFAULT 0,
    salary_expectation TEXT,
    availability TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employers Table
CREATE TABLE employers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT,
    country TEXT,
    logo_url TEXT,
    description TEXT,
    founded_year INTEGER,
    company_size TEXT,
    social_media JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'Active',
    verified BOOLEAN DEFAULT false,
    subscription_plan TEXT DEFAULT 'Free',
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Applications Table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'Submitted',
    application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    feedback TEXT,
    rejection_reason TEXT,
    interview_scheduled TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    source TEXT DEFAULT 'Website',
    is_archived BOOLEAN DEFAULT false,
    custom_fields JSONB DEFAULT '{}'::JSONB,
    CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

-- Employees Table
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    photo TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    employment_status TEXT DEFAULT 'Active',
    address TEXT,
    emergency_contact JSONB DEFAULT '{}'::JSONB,
    documents JSONB DEFAULT '{}'::JSONB,
    job_details JSONB DEFAULT '{}'::JSONB,
    salary_info JSONB DEFAULT '{}'::JSONB,
    attendance JSONB DEFAULT '{}'::JSONB,
    performance JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up RLS for all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tables

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone." 
    ON jobs FOR SELECT USING (true);
    
CREATE POLICY "Employers can create jobs." 
    ON jobs FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM employers WHERE user_id = auth.uid()
        )
    );
    
CREATE POLICY "Employers can update their own jobs." 
    ON jobs FOR UPDATE USING (
        employer_id IN (
            SELECT id FROM employers WHERE user_id = auth.uid()
        )
    );
    
CREATE POLICY "Employers can delete their own jobs." 
    ON jobs FOR DELETE USING (
        employer_id IN (
            SELECT id FROM employers WHERE user_id = auth.uid()
        )
    );

-- Candidate policies
CREATE POLICY "Candidates can view their own profile." 
    ON candidates FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM employers WHERE user_id = auth.uid()
        )
    );
    
CREATE POLICY "Candidates can update their own profile." 
    ON candidates FOR UPDATE USING (user_id = auth.uid());

-- Applications policies
CREATE POLICY "Candidates can view their own applications." 
    ON applications FOR SELECT USING (
        candidate_id IN (
            SELECT id FROM candidates WHERE user_id = auth.uid()
        ) OR
        employer_id IN (
            SELECT id FROM employers WHERE user_id = auth.uid()
        )
    );
    
CREATE POLICY "Candidates can create applications." 
    ON applications FOR INSERT WITH CHECK (
        candidate_id IN (
            SELECT id FROM candidates WHERE user_id = auth.uid()
        )
    );
    
CREATE POLICY "Employers can update applications for their jobs." 
    ON applications FOR UPDATE USING (
        employer_id IN (
            SELECT id FROM employers WHERE user_id = auth.uid()
        )
    );

-- Create triggers to update the applications_count in jobs
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs
    SET applications_count = (
        SELECT COUNT(*) FROM applications WHERE job_id = NEW.job_id AND is_archived = false
    )
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_change
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Create storage buckets
-- Note: If this fails, follow the manual bucket setup instructions in supabase_setup.md
BEGIN;
DO $$
BEGIN
    -- Create buckets if they don't exist
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'User avatars', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'resumes') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'Candidate resumes', false);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'company_logos') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('company_logos', 'Company logos', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'Employee documents', false);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create storage buckets automatically. Please set them up manually using instructions in supabase_setup.md';
END $$;
COMMIT;

-- Set up storage policies
-- These will only work if the buckets have been successfully created
BEGIN;
DO $$
BEGIN
    -- Avatar bucket policies
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible."
        ON storage.objects FOR SELECT
        USING (bucket_id = %L)
    ', 'avatars');
    
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Anyone can upload an avatar."
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = %L AND auth.role() = %L)
    ', 'avatars', 'authenticated');
    
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Users can update their own avatar."
        ON storage.objects FOR UPDATE
        USING (bucket_id = %L AND owner = auth.uid())
    ', 'avatars');
    
    -- Resume bucket policies
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Resumes are accessible by owners and employers."
        ON storage.objects FOR SELECT
        USING (
            bucket_id = %L AND 
            (owner = auth.uid() OR auth.uid() IN (SELECT user_id FROM employers))
        )
    ', 'resumes');
    
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Candidates can upload their resume."
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = %L AND auth.role() = %L)
    ', 'resumes', 'authenticated');
    
    -- Company logos bucket policies
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Company logos are publicly accessible."
        ON storage.objects FOR SELECT
        USING (bucket_id = %L)
    ', 'company_logos');
    
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Employers can upload company logos."
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = %L AND 
            auth.uid() IN (SELECT user_id FROM employers)
        )
    ', 'company_logos');
    
    -- Documents bucket policies
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Admin and HR can view all documents, employees can view their own."
        ON storage.objects FOR SELECT
        USING (
            bucket_id = %L AND 
            (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN (%L, %L)) OR auth.uid() = owner)
        )
    ', 'documents', 'admin', 'hr');
    
    EXECUTE format('
        CREATE POLICY IF NOT EXISTS "Admin and HR can upload documents."
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = %L AND 
            auth.uid() IN (SELECT user_id FROM profiles WHERE role IN (%L, %L))
        )
    ', 'documents', 'admin', 'hr');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create storage policies automatically. Please set them up manually using instructions in supabase_setup.md';
END $$;
COMMIT;

-- Create initial data (optional)

-- Create initial departments
INSERT INTO departments (name, code, description) VALUES
    ('Human Resources', 'HR', 'Manages employee relations and organizational development'),
    ('Information Technology', 'IT', 'Handles technical systems and support'),
    ('Finance', 'FIN', 'Manages financial operations and reporting'),
    ('Marketing', 'MKT', 'Handles brand promotion and customer acquisition'),
    ('Operations', 'OPS', 'Oversees day-to-day business activities');

-- Create initial positions
INSERT INTO positions (name, department_id, level) VALUES
    ('HR Manager', (SELECT id FROM departments WHERE code = 'HR'), 'manager'),
    ('Software Engineer', (SELECT id FROM departments WHERE code = 'IT'), 'staff'),
    ('Financial Analyst', (SELECT id FROM departments WHERE code = 'FIN'), 'staff'),
    ('Marketing Specialist', (SELECT id FROM departments WHERE code = 'MKT'), 'staff'),
    ('Operations Manager', (SELECT id FROM departments WHERE code = 'OPS'), 'manager');
