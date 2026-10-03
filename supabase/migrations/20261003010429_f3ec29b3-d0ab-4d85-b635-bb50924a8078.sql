ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS focal_mobile_x numeric NOT NULL DEFAULT 50 CHECK (focal_mobile_x BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS focal_mobile_y numeric NOT NULL DEFAULT 50 CHECK (focal_mobile_y BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS zoom_mobile numeric NOT NULL DEFAULT 1 CHECK (zoom_mobile BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS focal_desktop_x numeric NOT NULL DEFAULT 50 CHECK (focal_desktop_x BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS focal_desktop_y numeric NOT NULL DEFAULT 50 CHECK (focal_desktop_y BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS zoom_desktop numeric NOT NULL DEFAULT 1 CHECK (zoom_desktop BETWEEN 1 AND 3);