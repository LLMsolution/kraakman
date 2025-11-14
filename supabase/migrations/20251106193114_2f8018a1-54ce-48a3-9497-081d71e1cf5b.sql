-- Create enum for car status
CREATE TYPE car_status AS ENUM ('aanbod', 'verkocht');

-- Create cars table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merk TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT,
  bouwjaar INTEGER NOT NULL,
  transmissie TEXT,
  kleur TEXT,
  kilometerstand INTEGER,
  prijs DECIMAL(10, 2) NOT NULL,
  btw_auto BOOLEAN DEFAULT false,
  status car_status NOT NULL DEFAULT 'aanbod',
  omschrijving TEXT,
  opties TEXT,
  techniek TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_images table
CREATE TABLE public.car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$$;

-- RLS Policies for cars (public can read, only admins can modify)
CREATE POLICY "Anyone can view cars"
  ON public.cars
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert cars"
  ON public.cars
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update cars"
  ON public.cars
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete cars"
  ON public.cars
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for car_images
CREATE POLICY "Anyone can view car images"
  ON public.car_images
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert car images"
  ON public.car_images
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update car images"
  ON public.car_images
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete car images"
  ON public.car_images
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles (admins can manage)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true);

-- Storage policies for car images
CREATE POLICY "Anyone can view car images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'car-images');

CREATE POLICY "Admins can upload car images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'car-images' AND
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update car images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'car-images' AND
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete car images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'car-images' AND
    public.is_admin(auth.uid())
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cars table
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();