ALTER TABLE public.groups ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Allow code to be null for public groups (no invite code needed)
ALTER TABLE public.groups ALTER COLUMN code DROP NOT NULL;
