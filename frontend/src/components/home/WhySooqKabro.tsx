import { motion } from "framer-motion";
import { Gift, ShieldCheck, MapPin, Zap } from "lucide-react";

const items = [
  {
    icon: Gift,
    title: "100% Gratuit",
    desc: "Publiez vos annonces sans frais cachés",
    bg: "bg-green-100",
    fg: "text-green-700",
    ring: "ring-green-200",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé",
    desc: "Vendeurs vérifiés et conseils anti-arnaque",
    bg: "bg-blue-100",
    fg: "text-blue-700",
    ring: "ring-blue-200",
  },
  {
    icon: MapPin,
    title: "Local",
    desc: "Tchad, Cameroun, RCA, Gabon",
    bg: "bg-orange-100",
    fg: "text-orange-700",
    ring: "ring-orange-200",
  },
  {
    icon: Zap,
    title: "Rapide",
    desc: "Publication en 60 secondes",
    bg: "bg-yellow-100",
    fg: "text-yellow-700",
    ring: "ring-yellow-200",
  },
];

const WhySooqKabro = () => (
  <section
    className="relative my-6 rounded-3xl px-4 py-6 sm:py-8 overflow-hidden"
    style={{
      background:
        "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FFEDD5 100%)",
    }}
  >
    <div className="text-center mb-5">
      <h2 className="text-lg sm:text-2xl font-extrabold text-foreground">
        Pourquoi <span className="text-orange-600">SooqKabro</span> ?
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
        La marketplace pensée pour l'Afrique Centrale
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div
              className={`mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${it.bg} ${it.fg} ring-4 ${it.ring} flex items-center justify-center mb-2`}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-foreground">{it.title}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
              {it.desc}
            </p>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default WhySooqKabro;
