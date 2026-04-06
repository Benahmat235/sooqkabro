import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useTranslation } from "@/i18n/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-xs">SK</span>
          </div>
          <span className="text-base font-extrabold text-foreground">
            Sooq<span className="text-primary">Kabro</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-6">{t("footer.tagline")}</p>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3">{t("footer.categories")}</h4>
            <ul className="space-y-1.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/categorie/${cat.id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {t(`cat.${cat.id}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3">Liens</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("footer.about")}</Link></li>
              <li><Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("footer.help")}</Link></li>
              <li><Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              <li><Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <LanguageSwitcher />
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} SooqKabro. {t("footer.rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
