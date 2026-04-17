import { Link } from "react-router-dom";
import { PlusCircle, ArrowRight } from "lucide-react";

const PublishCTA = () => {
  return (
    <Link to="/publier" className="block">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[hsl(var(--chad-blue))] to-primary p-5 text-primary-foreground shadow-warm group hover:shadow-lg transition-shadow">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[hsl(var(--chad-yellow)/0.15)]" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[hsl(var(--chad-yellow)/0.1)]" />
        
        <div className="relative flex items-center gap-4">
          <div className="bg-[hsl(var(--chad-yellow))] rounded-2xl p-3 shadow-md">
            <PlusCircle className="h-7 w-7 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-base leading-tight">Vous avez quelque chose à vendre ?</h3>
            <p className="text-xs opacity-80 mt-0.5">Publiez gratuitement et touchez des milliers d'acheteurs</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default PublishCTA;
