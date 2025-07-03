
-- Create a storage bucket for profiles if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Make sure we have the correct policies for profile bucket
-- Note: Some policies might already exist, but this ensures they have the correct settings

-- Check if policy exists before trying to create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own profile files'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can upload their own profile files"
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);
        $policy$;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their own profile files'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can update their own profile files"
        ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);
        $policy$;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own profile files'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can delete their own profile files"
        ON storage.objects
        FOR DELETE
        USING (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);
        $policy$;
    END IF;
END
$$;
