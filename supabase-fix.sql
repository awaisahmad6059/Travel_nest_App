-- STEP 1: Fix profiles RLS infinite recursion
-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated read profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "Allow individual insert" ON profiles;
DROP POLICY IF EXISTS "Allow individual select" ON profiles;
DROP POLICY IF EXISTS "Allow individual update" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- List all remaining policies (run this to check what's left)
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- STEP 2: Create simple, non-recursive policies
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 3: Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.id (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'traveller')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- STEP 4: Also fix supplier_kyc_records RLS if needed
DROP POLICY IF EXISTS "Users can view own KYC" ON supplier_kyc_records;
DROP POLICY IF EXISTS "Users can insert own KYC" ON supplier_kyc_records;
DROP POLICY IF EXISTS "Users can update own KYC" ON supplier_kyc_records;
DROP POLICY IF EXISTS "kyc_select_own" ON supplier_kyc_records;
DROP POLICY IF EXISTS "kyc_insert_own" ON supplier_kyc_records;

CREATE POLICY "kyc_select_own"
  ON supplier_kyc_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kyc_insert_own"
  ON supplier_kyc_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_update_own"
  ON supplier_kyc_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STEP 5: Create profile for existing user Saud (find their auth user ID first)
-- Run this AFTER step 1-4 to backfill:
-- INSERT INTO profiles (id, full_name, role)
-- VALUES ('<SAUD_USER_UUID>', 'Saud', 'supplier')
-- ON CONFLICT (id) DO NOTHING;
