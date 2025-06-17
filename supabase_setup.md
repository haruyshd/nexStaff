# NexStaff - Supabase Integration Guide

This document provides instructions for setting up and using the Supabase integration in the NexStaff system.

## Supabase Setup

### 1. Database Setup

1. Log into your Supabase account and go to the SQL Editor.
2. Copy the entire SQL script from `supabase_schema.sql` file.
3. Paste and run the SQL script in your Supabase SQL Editor.

This will create the following tables:
- profiles
- departments
- positions
- jobs
- candidates
- employers
- applications
- employees

Along with Row Level Security (RLS) policies and storage buckets.

### 2. Authentication Setup

The system is already integrated with Supabase Authentication. Make sure you have enabled email/password authentication in your Supabase project.

1. Go to Authentication > Settings
2. Ensure Email provider is enabled
3. Configure Email templates as desired

### 3. Storage Setup

The SQL script creates these storage buckets:
- avatars - For user profile pictures
- resumes - For candidate resumes
- company_logos - For company logos
- documents - For employee documents

#### Manual Bucket Setup (if SQL bucket creation fails)

If the automatic bucket creation in the SQL script doesn't work properly, follow these steps to manually set up the storage buckets:

1. **Log in to your Supabase dashboard**
2. **Navigate to Storage in the left sidebar**
3. **Create the following buckets:**

##### Avatars Bucket
1. Click "Create Bucket"
2. Set Name: `avatars`
3. Check "Public bucket" option
4. Click "Create bucket"
5. After creation, go to "Policies" tab
6. Add these policies:
   - **Select Policy (View files):**
     - Policy name: "Avatar images are publicly accessible"
     - Using expression: `true`
     - Click "Save policy"
   - **Insert Policy (Upload files):**
     - Policy name: "Authenticated users can upload avatars"
     - Using expression: `auth.role() = 'authenticated'`
     - Click "Save policy"
   - **Update Policy (Update files):**
     - Policy name: "Users can update own avatars"
     - Using expression: `auth.uid() = owner`
     - Click "Save policy"

##### Resumes Bucket
1. Click "Create Bucket"
2. Set Name: `resumes`
3. Uncheck "Public bucket" (keep it private)
4. Click "Create bucket"
5. After creation, go to "Policies" tab
6. Add these policies:
   - **Select Policy (View files):**
     - Policy name: "Resume owners and employers can view"
     - Using expression: `auth.uid() = owner OR auth.uid() IN (SELECT user_id FROM employers)`
     - Click "Save policy"
   - **Insert Policy (Upload files):**
     - Policy name: "Candidates can upload resumes"
     - Using expression: `auth.role() = 'authenticated'`
     - Click "Save policy"
   - **Update Policy (Update files):**
     - Policy name: "Users can update own resumes"
     - Using expression: `auth.uid() = owner`
     - Click "Save policy"

##### Company Logos Bucket
1. Click "Create Bucket"
2. Set Name: `company_logos`
3. Check "Public bucket" option
4. Click "Create bucket"
5. After creation, go to "Policies" tab
6. Add these policies:
   - **Select Policy (View files):**
     - Policy name: "Company logos are publicly viewable"
     - Using expression: `true`
     - Click "Save policy"
   - **Insert Policy (Upload files):**
     - Policy name: "Employers can upload logos"
     - Using expression: `auth.uid() IN (SELECT user_id FROM employers)`
     - Click "Save policy"
   - **Update Policy (Update files):**
     - Policy name: "Employers can update their logos"
     - Using expression: `auth.uid() IN (SELECT user_id FROM employers) AND auth.uid() = owner`
     - Click "Save policy"

##### Documents Bucket
1. Click "Create Bucket"
2. Set Name: `documents`
3. Uncheck "Public bucket" (keep it private)
4. Click "Create bucket"
5. After creation, go to "Policies" tab
6. Add these policies:
   - **Select Policy (View files):**
     - Policy name: "Admin and HR can view all documents, employees can view their own"
     - Using expression: `auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'hr')) OR auth.uid() = owner`
     - Click "Save policy"
   - **Insert Policy (Upload files):**
     - Policy name: "Admin and HR can upload documents"
     - Using expression: `auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'hr'))`
     - Click "Save policy"
   - **Update Policy (Update files):**
     - Policy name: "Admin and HR can update documents"
     - Using expression: `auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'hr'))`
     - Click "Save policy"

## Environment Configuration

The Supabase client is already configured with your project URL and anon key in `client/js/supabaseClient.js`. 

If you need to change these values:

```javascript
const SUPABASE_URL = 'https://ihgjxasndhuuydyqsdvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ2p4YXNuZGh1dXlkeXFzZHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODk4MDIsImV4cCI6MjA2NTQ2NTgwMn0.Mvm40VEUbCZeEmyxnA6b6426Wh_CCDYFYkzyIP5tIT4';
```

## System Overview with Supabase

### Authentication

The system now uses Supabase Auth for:
- User signup/registration
- Login
- Password reset
- Session management

During the transition, the system also supports the previous local authentication as a fallback.

### Data Management

The `NexStaffDataManager` class has been updated to:
1. Check if Supabase is available
2. Use Supabase for data operations if available
3. Fall back to localStorage if Supabase is not available or operations fail

### Real-time Updates

The system is configured with Supabase's real-time subscription capabilities for:
- Jobs
- Applications
- Candidates

When data changes in one browser or client, other connected clients will receive updates.

## User Flow

### New Users

1. Users sign up through the registration form
2. A profile is automatically created in Supabase
3. The user can then log in using their credentials

### Existing Users

During the transition period:
1. The system will try to authenticate with Supabase first
2. If that fails, it will fall back to the local authentication system

### Employees/Admin Users

Admin users should be manually assigned the 'admin' role in the Supabase profiles table:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
```

## Migration Notes

### Data Migration

To migrate existing data from localStorage to Supabase:

1. Extract data from localStorage:
```javascript
const jobs = JSON.parse(localStorage.getItem('nexstaff_jobs'));
const candidates = JSON.parse(localStorage.getItem('nexstaff_candidates'));
const employers = JSON.parse(localStorage.getItem('nexstaff_employers'));
const applications = JSON.parse(localStorage.getItem('nexstaff_applications'));
const employees = JSON.parse(localStorage.getItem('nexstaff_employees'));
```

2. Insert data into Supabase using the provided API in `supabaseClient.js`:
```javascript
// Example for jobs
for (const job of jobs) {
    await SupabaseClient.db.jobs.create(job);
}
```

## Troubleshooting

### Authentication Issues

- Check browser console for error messages
- Ensure Supabase auth settings are properly configured
- Clear browser localStorage and try again
- Verify correct API keys are being used

### Employee Data Not Being Saved to Supabase

If employee data is not being saved to Supabase when using the "Add Employee" functionality:

1. **Check Console for Errors**: Open your browser's developer tools (F12) and check the console for any error messages when adding an employee.

2. **Verify Supabase Connection**: Ensure that the Supabase client is properly initialized before attempting to add employees. You should see "Supabase client initialized successfully" in the console.

3. **Check Table Structure**: Make sure your `employees` table in Supabase matches the expected structure:
   ```sql
   SELECT * FROM employees LIMIT 1;
   ```
   The key fields should include: `id`, `full_name`, `role`, `email`, `phone`, `photo`, `join_date`, `employment_status`.

4. **Test Direct Insert**: You can test inserting an employee directly through the SQL Editor:
   ```sql
   INSERT INTO employees (full_name, role, email, join_date, employment_status) 
   VALUES ('Test Employee', 'Developer', 'test@example.com', CURRENT_DATE, 'Active');
   ```

5. **Check RLS Policies**: Make sure your Row Level Security (RLS) policies are not blocking inserts. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
   ```
   (Remember to re-enable it after testing)

6. **Clear Browser Cache**: Sometimes clearing your browser cache can resolve issues with the Supabase client.

### Data Synchronization Issues

- Check network requests in browser DevTools
- Ensure Supabase Realtime is enabled in your project
- Verify RLS policies are correctly set up

### SQL Schema Issues

#### Reserved Keywords

If you encounter SQL errors during schema creation, it might be due to SQL reserved keywords. 
The following changes have been made to avoid these issues:

- `current_role` has been renamed to `current_position` in the candidates table since `ROLE` is a reserved SQL keyword

#### Storage Bucket Creation

If you encounter errors with storage bucket creation:
1. Run only the table creation part of the SQL script (everything before the storage bucket section)
2. Create buckets manually following the instructions in the "Manual Bucket Setup" section above
3. Run the policies part of the script or set up policies manually through the UI

## Support

For issues with the Supabase integration, please contact the development team.
