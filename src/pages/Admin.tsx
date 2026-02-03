import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Reference, Profile } from '@/lib/supabase-types';
import { 
  Shield, 
  Download, 
  Search, 
  Loader2, 
  FileText,
  Users,
  BookOpen,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [references, setReferences] = useState<Reference[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/dashboard');
        toast.error('Accès réservé aux administrateurs');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all references
      const { data: refsData } = await supabase
        .from('references')
        .select('*')
        .order('created_at', { ascending: false });

      const refs = (refsData as Reference[]) || [];
      setReferences(refs);

      // Fetch all profiles
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
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferences = references.filter(ref => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const authorName = profiles.get(ref.user_id)?.full_name?.toLowerCase() || '';
    return (
      ref.title.toLowerCase().includes(query) ||
      ref.journal?.toLowerCase().includes(query) ||
      authorName.includes(query)
    );
  });

  const documentTypeLabels: Record<string, string> = {
    article_scientifique: 'Article Scientifique',
    chapitre_livre: 'Chapitre de livre',
    ouvrage_scientifique: 'Ouvrage Scientifique',
    technologie: 'Technologie',
    innovation: 'Innovation',
  };

  const domaineLabels: Record<string, string> = {
    ST: 'Sciences et Technologies',
    SDS: 'Sciences de la Santé',
    LSH: 'Lettres et Sciences Humaines',
    SEG: 'Sciences Économiques et de Gestion',
    SJP: 'Sciences Juridiques et Politiques',
  };

  const handleExport = () => {
    const profile = (userId: string) => profiles.get(userId);
    
    const dataToExport = filteredReferences.map(ref => {
      const userProfile = profile(ref.user_id);
      return {
        institution: 'Université Lédéa Bernard OUEDRAOGO',
        nom_prenoms: userProfile?.full_name || 'Inconnu',
        ufr_institut: userProfile?.ufr_institut || '',
        departement: userProfile?.departement || '',
        equipe_recherche: userProfile?.equipe_recherche || '',
        type_document: ref.document_type ? documentTypeLabels[ref.document_type] : 'Article Scientifique',
        titre: ref.title,
        revue_journal_editeur: ref.journal || '',
        annee_parution: ref.annee_parution || '',
        auteurs: ref.authors?.join('; ') || '',
        affiliations: ref.affiliations?.join('; ') || '',
        domaine_technique: ref.domaine_technique ? domaineLabels[ref.domaine_technique] : '',
        statut_revue: ref.statut_revue || '',
        source_verification: ref.source_verification || ref.doi ? `https://doi.org/${ref.doi}` : '',
        resume: ref.abstract || '',
        pdf_url: ref.pdf_url || '',
        date_ajout: ref.created_at,
      };
    });

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (exportFormat) {
      case 'csv':
        const headers = Object.keys(dataToExport[0] || {}).join(',');
        const rows = dataToExport.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        );
        content = [headers, ...rows].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      
      default:
        content = JSON.stringify(dataToExport, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references-export-${new Date().toISOString().split('T')[0]}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export réussi !');
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Gestion des références</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{references.length}</p>
                <p className="text-sm text-muted-foreground">Références totales</p>
              </div>
            </div>
          </div>
          
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profiles.size}</p>
                <p className="text-sm text-muted-foreground">Contributeurs</p>
              </div>
            </div>
          </div>
          
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {references.filter(r => r.pdf_url).length}
                </p>
                <p className="text-sm text-muted-foreground">PDFs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleExport} disabled={filteredReferences.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exporter ({filteredReferences.length})
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Contributeur</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucune référence trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferences.map(ref => (
                  <TableRow key={ref.id}>
                    <TableCell className="max-w-[250px]">
                      <p className="line-clamp-2 font-medium">{ref.title}</p>
                      {ref.journal && (
                        <p className="text-xs text-muted-foreground">{ref.journal}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ref.document_type ? documentTypeLabels[ref.document_type] : 'Article'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ref.domaine_technique ? (
                        <Badge variant="secondary">{ref.domaine_technique}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profiles.get(ref.user_id)?.full_name || 'Inconnu'}</p>
                        {profiles.get(ref.user_id)?.departement && (
                          <p className="text-xs text-muted-foreground">{profiles.get(ref.user_id)?.departement}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ref.annee_parution || new Date(ref.created_at).getFullYear()}
                    </TableCell>
                    <TableCell>
                      {ref.pdf_url ? (
                        <a
                          href={ref.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
