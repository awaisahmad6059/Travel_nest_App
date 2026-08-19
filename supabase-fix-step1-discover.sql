-- ============================================
-- FIRST: Run this to discover profiles columns
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check supplier_kyc_records columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'supplier_kyc_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what constraints exist
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'supplier_kyc_records'::regclass;

-- List all policies on profiles
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'supplier_kyc_records');
