-- Create the claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    ocr_data JSONB,
    appeal_letter TEXT,
    status TEXT CHECK (status IN ('uploaded', 'processing', 'completed', 'error')) DEFAULT 'uploaded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own claims
CREATE POLICY "Users can only see their own claims" ON public.claims
    FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);