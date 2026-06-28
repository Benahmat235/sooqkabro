import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MapPin, Mail } from "lucide-react";

const cities = [
  "N'Djaména", "Moundou", "Sarh", "Abéché", "Doba",
  "Yaoundé", "Douala", "Bangui", "Libreville",
];

const Footer = () => {
  return (
    <footer className="mt-8 bg-[#0F172A] text-slate-200">
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #F97316 0%, #FACC15 50%, #16A34A 100%)",
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #F97316 0%, #FACC15 100%)",
                }}
              >
                <span className="font-extrabold text-sm text-white">SK</span>
              </div>
              <span className="font-extrabold text-lg">
                Sooq<span className="text-orange-400">Kabro</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La marketplace #1 de l'Afrique Centrale. Achetez, vendez, échangez
              en toute confiance.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-orange-500 hover:scale-110 transition-all flex items-center justify-center"
                  aria-label="Réseau social"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-400 mb-3">
              Plateforme
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/" className="hover:text-orange-300 transition-colors">Accueil</Link></li>
              <li><Link to="/decouvrir" className="hover:text-orange-300 transition-colors">Découvrir</Link></li>
              <li><Link to="/publier" className="hover:text-orange-300 transition-colors">Publier une annonce</Link></li>
              <li><Link to="/search" className="hover:text-orange-300 transition-colors">Recherche</Link></li>
              <li><Link to="/compte" className="hover:text-orange-300 transition-colors">Mon compte</Link></li>
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-yellow-400 mb-3">
              <MapPin className="inline h-3 w-3 mr-1" />
              Villes couvertes
            </h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-300">
              {cities.map((c) => (
                <li key={c} className="truncate">{c}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-green-400 mb-3">
              Contact
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 mt-0.5 text-green-400 shrink-0" />
                <span>contact@sooqkabro.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-green-400 shrink-0" />
                <span>N'Djaména, Tchad</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} SooqKabro — Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <a href="#" className="hover:text-orange-300">CGU</a>
            <a href="#" className="hover:text-orange-300">Confidentialité</a>
            <a href="#" className="hover:text-orange-300">Sécurité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
