import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reference } from '@/lib/supabase-types';
import { FileText, ExternalLink, Calendar, Users } from 'lucide-react';

interface ReferenceCardProps {
  reference: Reference;
  showAuthor?: boolean;
  authorName?: string;
}

export function ReferenceCard({ reference, showAuthor = false, authorName }: ReferenceCardProps) {
  return (
    <Card className="card-elevated group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link 
              to={`/reference/${reference.id}`}
              className="line-clamp-2 font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-primary"
            >
              {reference.title}
            </Link>
            
            {reference.authors && reference.authors.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="line-clamp-1">
                  {reference.authors.slice(0, 3).join(', ')}
                  {reference.authors.length > 3 && ` et ${reference.authors.length - 3} autres`}
                </span>
              </div>
            )}
          </div>
          
          {reference.pdf_url && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {reference.abstract && (
          <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
            {reference.abstract}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2">
          {reference.journal && (
            <Badge variant="secondary" className="text-xs">
              {reference.journal}
            </Badge>
          )}
          
          {reference.doi && (
            <a
              href={`https://doi.org/${reference.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              DOI
            </a>
          )}
          
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(reference.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
        
        {showAuthor && authorName && (
          <div className="mt-3 border-t border-border pt-3">
            <Link 
              to={`/profile/${reference.user_id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Ajouté par <span className="font-medium">{authorName}</span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
