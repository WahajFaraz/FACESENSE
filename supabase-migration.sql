-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- ========================================
-- 1. Create sessions table
-- ========================================
CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL DEFAULT 'Anonymous',
  dominant_emotion TEXT NOT NULL,
  dominant_value REAL NOT NULL DEFAULT 0,
  emotions_snapshot JSONB NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL DEFAULT ''
);

-- ========================================
-- 2. Enable Row Level Security
-- ========================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to insert (for logging sessions from the app)
CREATE POLICY "Allow public insert"
  ON sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Only authenticated users (admin) can read / delete
CREATE POLICY "Allow authenticated select"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete"
  ON sessions
  FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- 5. Create storage bucket for images
-- ========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-images', 'session-images', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Allow anyone to upload images (from the app)
CREATE POLICY "Allow public upload session-images"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'session-images');

-- 7. Only authenticated users (admin) can view / delete images
CREATE POLICY "Allow authenticated select session-images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'session-images');

CREATE POLICY "Allow authenticated delete session-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'session-images');
