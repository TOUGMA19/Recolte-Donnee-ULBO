-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ufr_institut text,
ADD COLUMN IF NOT EXISTS departement text,
ADD COLUMN IF NOT EXISTS equipe_recherche text;

-- Create enum for document types
CREATE TYPE public.document_type AS ENUM (
  'article_scientifique',
  'chapitre_livre',
  'ouvrage_scientifique',
  'technologie',
  'innovation'
);

-- Create enum for technical domains
CREATE TYPE public.domaine_technique AS ENUM (
  'ST',
  'SDS',
  'LSH',
  'SEG',
  'SJP'
);

-- Add new columns to references table
ALTER TABLE public.references 
ADD COLUMN IF NOT EXISTS document_type public.document_type DEFAULT 'article_scientifique',
ADD COLUMN IF NOT EXISTS annee_parution integer,
ADD COLUMN IF NOT EXISTS domaine_technique public.domaine_technique,
ADD COLUMN IF NOT EXISTS statut_revue text,
ADD COLUMN IF NOT EXISTS source_verification text;