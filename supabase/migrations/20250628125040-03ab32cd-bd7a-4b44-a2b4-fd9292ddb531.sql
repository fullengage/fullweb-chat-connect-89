
-- Create a safe function to get valid users with proper filtering
CREATE OR REPLACE FUNCTION public.get_valid_users()
RETURNS TABLE(
  id uuid,
  account_id bigint,
  role text,
  name text,
  email text,
  avatar_url text,
  auth_user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.account_id,
    u.role,
    u.name,
    u.email,
    u.avatar_url,
    u.auth_user_id,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE 
    u.id IS NOT NULL 
    AND u.id::text != ''
    AND u.name IS NOT NULL 
    AND u.name != ''
    AND u.email IS NOT NULL 
    AND u.email != ''
    AND u.email LIKE '%@%'
    AND u.isactive = true
  ORDER BY u.name;
END;
$$;

-- Create RLS policy for the function
CREATE POLICY "Users can call get_valid_users function"
  ON public.users
  FOR SELECT
  USING (true);
