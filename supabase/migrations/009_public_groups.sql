ALTER TABLE public.groups ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Allow public groups to be discoverable
-- Private groups still require the code (lookup by code is already allowed)
