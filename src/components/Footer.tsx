import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t mt-8 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-xs">TC</span>
          </div>
          <span className="text-base font-extrabold text-foreground">
            Tchad<span className="text-primary">Market</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          La première marketplace du Tchad. Achetez et vendez facilement.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Navigation</h4>
            <Link to="/" className="block text-muted-foreground hover:text-primary">Accueil</Link>
            <Link to="/search" className="block text-muted-foreground hover:text-primary">Rechercher</Link>
            <Link to="/publier" className="block text-muted-foreground hover:text-primary">Publier</Link>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Informations</h4>
            <span className="block text-muted-foreground">Conditions d'utilisation</span>
            <span className="block text-muted-foreground">Confidentialité</span>
            <span className="block text-muted-foreground">Aide & Support</span>
          </div>
        </div>
        <div className="border-t mt-6 pt-4">
          <p className="text-[10px] text-muted-foreground text-center">
            © {new Date().getFullYear()} TchadMarket. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
