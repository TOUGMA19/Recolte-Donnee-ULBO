import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-bold">ScholarRef</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/references" className="transition-colors hover:text-foreground">
              Explorer
            </Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Connexion
            </Link>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © 2024 ScholarRef. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
