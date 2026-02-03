import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ReferenceCard } from '@/components/references/ReferenceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Reference, Profile } from '@/lib/supabase-types';
import { Search, Loader2, BookOpen, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function References() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    setIsLoading(true);
    try {
      const { data: refsData, error: refsError } = await supabase
        .from('references')
        .select('*')
        .order('created_at', { ascending: false });

      if (refsError) throw refsError;

      const refs = (refsData as Reference[]) || [];
      setReferences(refs);

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(refs.map(r => r.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        const profilesMap = new Map<string, Profile>();
        (profilesData as Profile[] || []).forEach(p => {
          profilesMap.set(p.user_id, p);
        });
        setProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error fetching references:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferences = references
    .filter(ref => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        ref.title.toLowerCase().includes(query) ||
        ref.abstract?.toLowerCase().includes(query) ||
        ref.journal?.toLowerCase().includes(query) ||
        ref.authors?.some(a => a.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold">Explorer les références</h1>
          <p className="mt-2 text-muted-foreground">
            Découvrez les publications partagées par la communauté
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, auteur, journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="oldest">Plus anciens</SelectItem>
              <SelectItem value="title">Titre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="card-elevated rounded-xl py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-lg font-semibold">
              {searchQuery ? 'Aucun résultat' : 'Aucune référence'}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery 
                ? 'Essayez avec d\'autres termes de recherche'
                : 'Soyez le premier à partager une référence'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filteredReferences.length} référence{filteredReferences.length > 1 ? 's' : ''} trouvée{filteredReferences.length > 1 ? 's' : ''}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReferences.map(reference => (
                <ReferenceCard 
                  key={reference.id} 
                  reference={reference} 
                  showAuthor
                  authorName={profiles.get(reference.user_id)?.full_name || 'Anonyme'}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
