-- Allow code to be null for public groups (no invite code needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'groups' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.groups ADD COLUMN is_public boolean NOT NULL DEFAULT false;
  END IF;
END $$;

ALTER TABLE public.groups ALTER COLUMN code DROP NOT NULL;
