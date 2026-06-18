import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 pb-24 md:pb-8">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center">
                <span className="text-primary-foreground font-extrabold text-xs">SK</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Kabro<span className="text-primary"> shop</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto md:mx-0">
              Your premier local marketplace to find what you need. Buy, sell, and discover amazing items right in your neighborhood.
            </p>
          </div>

          {/* Column 2: Help & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Help & Support</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trust & Safety</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Selling Tips</Link></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/publier" className="text-sm text-muted-foreground hover:text-primary transition-colors">Post an Ad</Link></li>
              <li><Link to="/decouvrir" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Categories</Link></li>
              <li><Link to="/favoris" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Favorites</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kabro shop. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social placeholder links */}
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Facebook</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Twitter</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
