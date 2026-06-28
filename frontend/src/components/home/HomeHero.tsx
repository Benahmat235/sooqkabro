import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const HomeHero = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl mt-3 mb-4 shadow-warm">
      {/* Warm Sahara gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #F97316 0%, #FACC15 45%, #F97316 70%, #B91C1C 100%)",
        }}
        aria-hidden
      />
      {/* Decorative market-pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 35%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.25) 0, transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 12px, transparent 12px 24px)",
        }}
        aria-hidden
      />

      <div className="relative px-5 py-8 sm:py-12 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-[11px] font-bold mb-3"
        >
          <Sparkles className="h-3 w-3" />
          La marketplace #1 de l'Afrique Centrale
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md"
        >
          Achetez et vendez <span className="text-yellow-200">au Tchad</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-2 text-sm sm:text-base font-medium text-white/90 max-w-xl mx-auto"
        >
          Des milliers d'annonces locales — véhicules, immobilier, téléphones, services…
        </motion.p>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 max-w-2xl mx-auto flex items-center gap-2 bg-white rounded-full p-1.5 shadow-xl-warm"
        >
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="h-4 w-4 text-orange-500 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Que recherchez-vous aujourd'hui ?"
              className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground py-2"
              aria-label="Recherche d'annonces"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full px-4 sm:px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            }}
          >
            Rechercher
          </button>
        </motion.form>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 flex items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs font-semibold text-white/95"
        >
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-extrabold">10K+</span>
            <span className="opacity-90">Annonces</span>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-extrabold">23</span>
            <span className="opacity-90">Régions</span>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-extrabold">100%</span>
            <span className="opacity-90">Gratuit</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
