-- ==========================================
-- FIX: profiles RLS infinite recursion
-- This fixes supplier_kyc_records too (its
-- policies reference profiles)
-- ==========================================

-- STEP 1: Drop ALL policies on profiles
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
  END LOOP;
END $$;

-- STEP 2: Create simple non-recursive profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 3: Drop ALL policies on supplier_kyc_records
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'supplier_kyc_records' AND schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.supplier_kyc_records';
  END LOOP;
END $$;

-- STEP 4: Create simple non-recursive KYC policies
CREATE POLICY "kyc_select_own" ON public.supplier_kyc_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kyc_insert_own" ON public.supplier_kyc_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_update_own" ON public.supplier_kyc_records
  FOR UPDATE USING (auth.uid() = user_id);

-- STEP 5: Auto-create profile on signup (so FK never fails)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'role', 'traveller'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Create profile for existing mobile users who don't have one
-- (Saud and any other mobile signups)
-- First find them:
-- SELECT au.id, au.email FROM auth.users au
-- LEFT JOIN public.profiles p ON p.id = au.id
-- WHERE p.id IS NULL;

-- Then create profiles (replace UUIDs from above query):
-- INSERT INTO public.profiles (id, role)
-- SELECT au.id, COALESCE(au.raw_user_meta_data ->> 'role', 'traveller')
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON p.id = au.id
-- WHERE p.id IS NULL
-- ON CONFLICT (id) DO NOTHING;
