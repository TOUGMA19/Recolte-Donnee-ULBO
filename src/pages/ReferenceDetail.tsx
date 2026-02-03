import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Reference, Profile, DocumentType, DomaineTechnique } from '@/lib/supabase-types';
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  Users, 
  Building, 
  ArrowLeft,
  Download,
  Loader2,
  BookOpen,
  Tag,
  Link as LinkIcon
} from 'lucide-react';

const documentTypeLabels: Record<DocumentType, string> = {
  article_scientifique: 'Article Scientifique',
  chapitre_livre: 'Chapitre de livre',
  ouvrage_scientifique: 'Ouvrage Scientifique',
  technologie: 'Technologie',
  innovation: 'Innovation',
};

const domaineLabels: Record<DomaineTechnique, string> = {
  ST: 'Sciences et Technologies',
  SDS: 'Sciences de la Santé',
  LSH: 'Lettres et Sciences Humaines',
  SEG: 'Sciences Économiques et de Gestion',
  SJP: 'Sciences Juridiques et Politiques',
};

export default function ReferenceDetail() {
  const { referenceId } = useParams<{ referenceId: string }>();
  const [reference, setReference] = useState<Reference | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (referenceId) {
      fetchReference();
    }
  }, [referenceId]);

  const fetchReference = async () => {
    setIsLoading(true);
    try {
      const { data: refData } = await supabase
        .from('references')
        .select('*')
        .eq('id', referenceId)
        .single();

      if (refData) {
        setReference(refData as Reference);
        
        // Fetch author profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', refData.user_id)
          .single();
        
        setAuthor(profileData as Profile | null);
      }
    } catch (error) {
      console.error('Error fetching reference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!reference) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Référence non trouvée</h1>
          <p className="mt-2 text-muted-foreground">
            Cette référence n'existe pas ou a été supprimée
          </p>
          <Button asChild className="mt-6">
            <Link to="/references">Explorer les références</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/references">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux références
          </Link>
        </Button>

        {/* Main content */}
        <article className="card-elevated overflow-hidden rounded-xl">
          <div className="p-6 sm:p-8">
            {/* Title */}
            <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
              {reference.title}
            </h1>

            {/* Authors */}
            {reference.authors && reference.authors.length > 0 && (
              <div className="mt-4 flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {reference.authors.join(', ')}
                </p>
              </div>
            )}

            {/* Affiliations */}
            {reference.affiliations && reference.affiliations.length > 0 && (
              <div className="mt-2 flex items-start gap-2">
                <Building className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {reference.affiliations.join(' • ')}
                </p>
              </div>
            )}

            {/* Meta info */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {reference.document_type && (
                <Badge variant="outline" className="text-sm">
                  {documentTypeLabels[reference.document_type]}
                </Badge>
              )}
              
              {reference.domaine_technique && (
                <Badge variant="secondary" className="text-sm">
                  {reference.domaine_technique} - {domaineLabels[reference.domaine_technique]}
                </Badge>
              )}
              
              {reference.journal && (
                <Badge className="text-sm">
                  {reference.journal}
                </Badge>
              )}
              
              {reference.annee_parution && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {reference.annee_parution}
                </div>
              )}
            </div>

            {/* Additional details */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {reference.doi && (
                <a
                  href={`https://doi.org/${reference.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  DOI: {reference.doi}
                </a>
              )}
              
              {reference.statut_revue && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  {reference.statut_revue}
                </div>
              )}
              
              {reference.source_verification && (
                <a
                  href={reference.source_verification.startsWith('http') ? reference.source_verification : `https://${reference.source_verification}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  Source de vérification
                </a>
              )}
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Ajouté le {new Date(reference.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Abstract */}
            {reference.abstract && (
              <div className="mt-8">
                <h2 className="mb-3 font-serif text-lg font-semibold">Résumé</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {reference.abstract}
                </p>
              </div>
            )}

            {/* PDF download */}
            {reference.pdf_url && (
              <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{reference.pdf_filename || 'Document PDF'}</p>
                      <p className="text-sm text-muted-foreground">Télécharger l'article complet</p>
                    </div>
                  </div>
                  <Button asChild>
                    <a href={reference.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Author info */}
            {author && (
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">Ajouté par</p>
                <Link 
                  to={`/profile/${reference.user_id}`}
                  className="mt-2 inline-flex items-center gap-2 font-medium hover:text-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  {author.full_name || 'Chercheur'}
                </Link>
              </div>
            )}
          </div>
        </article>
      </div>
    </Layout>
  );
}
