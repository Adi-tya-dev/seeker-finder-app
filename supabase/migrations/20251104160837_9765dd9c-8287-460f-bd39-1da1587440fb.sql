-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- Create policies for item images
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Users can update their own item images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'item-images');

CREATE POLICY "Users can delete their own item images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-images');