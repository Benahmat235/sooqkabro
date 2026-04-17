import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Ne montrer le prompt qu'après 30 secondes si l'utilisateur n'a pas encore installé
      const hasDeclinedBefore = localStorage.getItem('pwa-install-declined');
      if (!hasDeclinedBefore) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000); // 30 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Détection si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA already installed');
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      localStorage.setItem('pwa-install-declined', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Ne pas enregistrer comme décliné pour permettre un autre prompt plus tard
    setTimeout(() => {
      const hasDeclinedBefore = localStorage.getItem('pwa-install-declined');
      if (!hasDeclinedBefore) {
        setShowPrompt(true);
      }
    }, 300000); // Show again in 5 minutes if not declined
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl-warm p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-sm text-foreground mb-1">
                  Installer SooqKabro
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Installez l'application pour un accès rapide, des notifications et une expérience hors ligne.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Installer
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Plus tard
              </Button>
            </div>

            {/* Install benefits */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg mb-1">⚡</div>
                  <p className="text-[10px] text-muted-foreground">Plus rapide</p>
                </div>
                <div>
                  <div className="text-lg mb-1">🔔</div>
                  <p className="text-[10px] text-muted-foreground">Notifications</p>
                </div>
                <div>
                  <div className="text-lg mb-1">📱</div>
                  <p className="text-[10px] text-muted-foreground">Hors ligne</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
