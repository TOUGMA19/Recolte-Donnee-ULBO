import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ReferenceCard } from '@/components/references/ReferenceCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Reference, Profile } from '@/lib/supabase-types';
import { User, BookOpen, Building, Calendar, Loader2 } from 'lucide-react';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfileAndReferences();
    }
  }, [userId]);

  const fetchProfileAndReferences = async () => {
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      setProfile(profileData as Profile | null);

      // Fetch references
      const { data: refsData } = await supabase
        .from('references')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setReferences((refsData as Reference[]) || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  if (!profile) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <User className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Profil non trouvé</h1>
          <p className="mt-2 text-muted-foreground">
            Ce profil n'existe pas ou a été supprimé
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
      <div className="container py-8">
        {/* Profile Header */}
        <div className="card-elevated mb-8 overflow-hidden rounded-xl">
          <div className="hero-gradient h-32" />
          <div className="relative px-6 pb-6">
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            
            <div className="pt-16">
              <h1 className="font-serif text-2xl font-bold">
                {profile.full_name || 'Chercheur'}
              </h1>
              
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.institution && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {profile.institution}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {profile.bio && (
                <p className="mt-4 text-muted-foreground">{profile.bio}</p>
              )}

              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{references.length}</span>
                  <span className="text-muted-foreground">
                    référence{references.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* References */}
        <div>
          <h2 className="mb-6 font-serif text-xl font-bold">Publications</h2>
          
          {references.length === 0 ? (
            <div className="card-elevated rounded-xl py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Aucune publication pour le moment
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {references.map(reference => (
                <ReferenceCard key={reference.id} reference={reference} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
