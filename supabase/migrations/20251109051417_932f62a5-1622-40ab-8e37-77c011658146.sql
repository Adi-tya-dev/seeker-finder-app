-- Fix PUBLIC_DATA_EXPOSURE: Remove overly permissive profile policy
-- and replace with properly scoped access controls

-- Step 1: Drop the insecure policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Step 2: Create properly scoped policies

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can view profiles of conversation participants
-- (allows viewing contact info of people you're chatting with)
CREATE POLICY "Users can view conversation participants" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE (conversations.uploader_id = auth.uid() AND conversations.claimer_id = profiles.id)
         OR (conversations.claimer_id = auth.uid() AND conversations.uploader_id = profiles.id)
    )
  );

-- Policy 3: Users can view profiles of item uploaders
-- (allows viewing contact info on the browse items page)
CREATE POLICY "Users can view item uploaders" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.uploader_id = profiles.id
    )
  );

-- Policy 4: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
  );