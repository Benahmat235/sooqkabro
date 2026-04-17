import { useToast } from "@/hooks/use-toast";
import { parseError, type UserFriendlyError } from "@/lib/errorHandler";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface AppToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Enhanced toast hook with error handling and better UX
 */
export function useAppToast() {
  const { toast, dismiss, toasts } = useToast();

  /**
   * Show a success toast
   */
  const success = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "success" as any,
      duration: 4000,
    });
  };

  /**
   * Show an info toast
   */
  const info = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "info" as any,
      duration: 5000,
    });
  };

  /**
   * Show a warning toast
   */
  const warning = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "warning" as any,
      duration: 6000,
    });
  };

  /**
   * Show an error toast - automatically parses technical errors
   */
  const error = (errorOrMessage: unknown, fallbackTitle?: string) => {
    let toastData: { title: string; description: string; variant: ToastVariant };

    if (typeof errorOrMessage === 'string') {
      // Simple string message
      toastData = {
        title: fallbackTitle || "Erreur",
        description: errorOrMessage,
        variant: "destructive",
      };
    } else {
      // Parse technical error to user-friendly message
      const parsed = parseError(errorOrMessage);
      toastData = {
        title: parsed.title,
        description: parsed.description,
        variant: parsed.type === 'warning' ? 'warning' : parsed.type === 'info' ? 'info' : 'destructive',
      };
    }

    return toast({
      ...toastData,
      duration: 6000,
    });
  };

  /**
   * Show a custom toast
   */
  const show = (options: AppToastOptions) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: (options.variant || "default") as any,
      duration: options.duration || 5000,
    });
  };

  /**
   * Handle an async operation with automatic error handling
   */
  const handleAsync = async <T>(
    promise: Promise<T>,
    options?: {
      loadingTitle?: string;
      successTitle?: string;
      successDescription?: string;
      errorTitle?: string;
    }
  ): Promise<{ data: T | null; error: UserFriendlyError | null }> => {
    try {
      const data = await promise;
      if (options?.successTitle) {
        success(options.successTitle, options.successDescription);
      }
      return { data, error: null };
    } catch (err) {
      const parsed = parseError(err);
      error(err, options?.errorTitle);
      return { data: null, error: parsed };
    }
  };

  return {
    toast: show,
    success,
    info,
    warning,
    error,
    handleAsync,
    dismiss,
    toasts,
  };
}
