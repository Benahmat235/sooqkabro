import { useTranslation } from "@/i18n/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t mt-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-[8px]">SK</span>
            </div>
            <span className="text-xs font-bold text-foreground">
              Sooq<span className="text-primary">Kabro</span>
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} SooqKabro
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
