-- Add 'archived' column to cases table
ALTER TABLE public.cases
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create an ENUM type for user roles for data consistency
CREATE TYPE public.user_role AS ENUM ('admin', 'lawyer', 'assistant');

-- Add the role column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN role public.user_role NOT NULL DEFAULT 'lawyer';

-- Create a helper function to get a user's role securely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Update RLS policies on profiles to allow admins to manage them
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Allow users to see their own profile, and admins to see all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  (auth.uid() = id) OR (get_user_role(auth.uid()) = 'admin')
);

-- Allow users to update their own profile, and admins to update any profile
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  (auth.uid() = id) OR (get_user_role(auth.uid()) = 'admin')
)
WITH CHECK (
  (auth.uid() = id) OR (get_user_role(auth.uid()) = 'admin')
);

-- Update the function to set a default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    'lawyer' -- Default role for new sign-ups
  );
  RETURN new;
END;
$$;