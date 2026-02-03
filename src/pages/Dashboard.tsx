import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PDFUploader } from '@/components/references/PDFUploader';
import { ReferenceCard } from '@/components/references/ReferenceCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Reference } from '@/lib/supabase-types';
import { BookOpen, Plus, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('references');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReferences();
    }
  }, [user]);

  const fetchReferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('references')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferences((data as Reference[]) || []);
    } catch (error) {
      console.error('Error fetching references:', error);
      toast.error('Erreur lors du chargement des références');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('references')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReferences(prev => prev.filter(ref => ref.id !== id));
      toast.success('Référence supprimée');
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold">
            Bienvenue, {profile?.full_name || 'Chercheur'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos références scientifiques
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{references.length}</p>
                <p className="text-sm text-muted-foreground">Références</p>
              </div>
            </div>
          </div>
          
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <FileText className="h-6 w-6 text-accent" />
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="references">Mes références</TabsTrigger>
            <TabsTrigger value="add">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="references">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : references.length === 0 ? (
              <div className="card-elevated rounded-xl py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-serif text-lg font-semibold">
                  Aucune référence
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Commencez par ajouter votre première référence
                </p>
                <Button className="mt-6" onClick={() => setActiveTab('add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une référence
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {references.map(reference => (
                  <ReferenceCard key={reference.id} reference={reference} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <div className="mx-auto max-w-2xl">
              <PDFUploader onSuccess={() => {
                fetchReferences();
                setActiveTab('references');
              }} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
