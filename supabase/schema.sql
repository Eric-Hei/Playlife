-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'voyageur',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  mission_type TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create structures table
CREATE TABLE IF NOT EXISTS public.structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Missions are viewable by everyone" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can create/update missions" ON public.missions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Structures are viewable by everyone" ON public.structures FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can create/update structures" ON public.structures FOR ALL USING (auth.role() = 'authenticated');
