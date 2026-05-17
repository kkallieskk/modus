-- Change default status to approved for all future signups
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved';

-- Update all currently pending users to approved
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';
