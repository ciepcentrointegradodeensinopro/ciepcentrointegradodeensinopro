-- Update default status to pending
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

-- Update existing users who are not admins to pending if they were just created (optional, but safer for testing)
-- UPDATE public.profiles SET status = 'pending' WHERE role = 'student' AND status = 'active';
