-- Create a secure function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
BEGIN
  -- Delete the user from auth.users (which cascades to public.profiles)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
