import { Link } from "react-router-dom";
import { PlusCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PublishCTA = () => {
  return (
    <Link to="/publier" className="block">
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[hsl(var(--chad-blue))] to-primary/90 p-5 text-primary-foreground shadow-warm hover:shadow-xl-warm transition-shadow"
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
            repeatDelay: 2,
          }}
        />

        {/* Decorative circles with animation */}
        <motion.div 
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[hsl(var(--chad-yellow)/0.2)]"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[hsl(var(--chad-yellow)/0.15)]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Sparkles effect */}
        <motion.div
          className="absolute top-4 right-20"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="h-4 w-4 text-[hsl(var(--chad-yellow))]" />
        </motion.div>
        
        <div className="relative flex items-center gap-4">
          <motion.div 
            className="bg-[hsl(var(--chad-yellow))] rounded-2xl p-3 shadow-lg"
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <PlusCircle className="h-7 w-7 text-foreground" />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-extrabold text-base leading-tight mb-1">
              Vous avez quelque chose à vendre ?
            </h3>
            <p className="text-xs opacity-90">
              Publiez gratuitement et touchez des milliers d'acheteurs
            </p>
          </div>
          
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowRight className="h-5 w-5 shrink-0" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PublishCTA;
