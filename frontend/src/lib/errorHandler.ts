/**
 * Error Handler Utility
 * Maps technical errors to user-friendly messages
 */

export interface UserFriendlyError {
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
  actionLabel?: string;
}

// Common Supabase/PostgreSQL error patterns
const errorPatterns: Array<{
  pattern: RegExp | string;
  handler: (match: RegExpMatchArray | null, originalError: string) => UserFriendlyError;
}> = [
  // Schema/Column errors
  {
    pattern: /could not find the ['"]?(\w+)['"]? column/i,
    handler: () => ({
      title: "Mise a jour requise",
      description: "L'application necessite une mise a jour. Veuillez rafraichir la page.",
      type: 'warning',
      action: 'refresh',
      actionLabel: 'Rafraichir'
    })
  },
  {
    pattern: /schema cache/i,
    handler: () => ({
      title: "Erreur temporaire",
      description: "Un probleme technique est survenu. Reessayez dans quelques instants.",
      type: 'warning',
      action: 'retry',
      actionLabel: 'Reessayer'
    })
  },
  // Authentication errors
  {
    pattern: /invalid login credentials/i,
    handler: () => ({
      title: "Connexion echouee",
      description: "Email ou mot de passe incorrect. Verifiez vos identifiants.",
      type: 'error'
    })
  },
  {
    pattern: /email not confirmed/i,
    handler: () => ({
      title: "Email non verifie",
      description: "Veuillez confirmer votre email avant de vous connecter.",
      type: 'warning'
    })
  },
  {
    pattern: /user already registered/i,
    handler: () => ({
      title: "Compte existant",
      description: "Un compte avec cet email existe deja. Connectez-vous ou reinitialiser votre mot de passe.",
      type: 'info'
    })
  },
  {
    pattern: /password.*too (short|weak)/i,
    handler: () => ({
      title: "Mot de passe faible",
      description: "Choisissez un mot de passe plus fort (8+ caracteres, majuscules, chiffres).",
      type: 'error'
    })
  },
  // Network errors
  {
    pattern: /network|fetch|connection|timeout/i,
    handler: () => ({
      title: "Probleme de connexion",
      description: "Verifiez votre connexion internet et reessayez.",
      type: 'warning',
      action: 'retry',
      actionLabel: 'Reessayer'
    })
  },
  {
    pattern: /failed to fetch/i,
    handler: () => ({
      title: "Connexion perdue",
      description: "Impossible de joindre le serveur. Verifiez votre connexion.",
      type: 'warning'
    })
  },
  // Permission errors
  {
    pattern: /permission denied|not authorized|unauthorized/i,
    handler: () => ({
      title: "Acces refuse",
      description: "Vous n'avez pas les droits pour effectuer cette action.",
      type: 'error'
    })
  },
  {
    pattern: /row-level security/i,
    handler: () => ({
      title: "Action non autorisee",
      description: "Cette action n'est pas permise pour votre compte.",
      type: 'error'
    })
  },
  // Storage errors
  {
    pattern: /storage|bucket|upload/i,
    handler: () => ({
      title: "Echec du telechargement",
      description: "Impossible de telecharger le fichier. Verifiez sa taille et son format.",
      type: 'error'
    })
  },
  {
    pattern: /file.*too (large|big)|payload too large/i,
    handler: () => ({
      title: "Fichier trop volumineux",
      description: "La taille maximale autorisee est de 5 Mo par fichier.",
      type: 'error'
    })
  },
  // Database constraint errors
  {
    pattern: /duplicate key|unique constraint/i,
    handler: () => ({
      title: "Doublon detecte",
      description: "Cette information existe deja dans le systeme.",
      type: 'warning'
    })
  },
  {
    pattern: /foreign key|reference constraint/i,
    handler: () => ({
      title: "Donnee liee",
      description: "Cet element est lie a d'autres donnees et ne peut pas etre modifie.",
      type: 'error'
    })
  },
  {
    pattern: /null value|not-null constraint/i,
    handler: () => ({
      title: "Information manquante",
      description: "Veuillez remplir tous les champs obligatoires.",
      type: 'error'
    })
  },
  // Rate limiting
  {
    pattern: /rate limit|too many requests/i,
    handler: () => ({
      title: "Trop de requetes",
      description: "Veuillez patienter quelques instants avant de reessayer.",
      type: 'warning'
    })
  },
  // Server errors
  {
    pattern: /internal server error|500/i,
    handler: () => ({
      title: "Erreur serveur",
      description: "Une erreur est survenue de notre cote. Nous travaillons a la resoudre.",
      type: 'error'
    })
  },
  {
    pattern: /service unavailable|503/i,
    handler: () => ({
      title: "Service indisponible",
      description: "Le service est temporairement indisponible. Reessayez plus tard.",
      type: 'warning'
    })
  },
];

/**
 * Parse a technical error and return a user-friendly message
 */
export function parseError(error: unknown): UserFriendlyError {
  // Extract error message string
  let errorMessage = '';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = (error as any).message || (error as any).error || JSON.stringify(error);
  }

  // Try to match against known patterns
  for (const { pattern, handler } of errorPatterns) {
    if (typeof pattern === 'string') {
      if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return handler(null, errorMessage);
      }
    } else {
      const match = errorMessage.match(pattern);
      if (match) {
        return handler(match, errorMessage);
      }
    }
  }

  // Default fallback for unknown errors
  return {
    title: "Une erreur est survenue",
    description: "Veuillez reessayer. Si le probleme persiste, contactez le support.",
    type: 'error'
  };
}

/**
 * Log error for debugging while returning user-friendly message
 */
export function handleError(error: unknown, context?: string): UserFriendlyError {
  // Log the full error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
  }
  
  return parseError(error);
}

/**
 * Create a safe error handler wrapper for async functions
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<{ data: Awaited<ReturnType<T>> | null; error: UserFriendlyError | null }> {
  return async (...args: Parameters<T>) => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: handleError(err, context) };
    }
  };
}
