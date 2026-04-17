import imageCompression from 'browser-image-compression';

/**
 * Options de compression d'images optimisées pour mobile
 */
export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

/**
 * Compresse une image pour optimiser la taille et les performances
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // 1MB max
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true, // Utiliser un web worker pour ne pas bloquer l'UI
    fileType: 'image/jpeg', // Format de sortie
    initialQuality: 0.8, // Qualité initiale (80%)
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    // Si la compression n'a pas réduit suffisamment, réduire la qualité
    if (compressedFile.size > file.size * 0.9) {
      return await imageCompression(file, {
        ...defaultOptions,
        initialQuality: 0.6,
      });
    }

    console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Retourner le fichier original en cas d'erreur
  }
}

/**
 * Compresse plusieurs images en parallèle
 */
export async function compressMultipleImages(
  files: File[],
  options: ImageCompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const compressedFile = await compressImage(files[i], options);
    compressed.push(compressedFile);
    onProgress?.(i + 1, files.length);
  }

  return compressed;
}

/**
 * Crée une prévisualisation d'image optimisée pour l'affichage
 */
export async function createImagePreview(
  file: File,
  maxDimension: number = 400
): Promise<string> {
  const options = {
    maxSizeMB: 0.1, // 100KB max pour preview
    maxWidthOrHeight: maxDimension,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return URL.createObjectURL(compressedFile);
  } catch (error) {
    console.error('Error creating preview:', error);
    return URL.createObjectURL(file);
  }
}

/**
 * Convertit une image en WebP pour une meilleure compression
 */
export async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Blob creation failed'));
            return;
          }

          const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        }, 'image/webp', 0.85);
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valide les dimensions et le format d'une image
 */
export async function validateImage(
  file: File,
  options: {
    maxSizeMB?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedTypes?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSizeMB = 10,
    minWidth = 200,
    minHeight = 200,
    maxWidth = 4096,
    maxHeight = 4096,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  } = options;

  // Vérifier le type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Utilisez: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`,
    };
  }

  // Vérifier la taille
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `L'image est trop grande (${sizeMB.toFixed(1)}MB). Maximum: ${maxSizeMB}MB`,
    };
  }

  // Vérifier les dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return {
        valid: false,
        error: `Image trop petite (${dimensions.width}x${dimensions.height}). Minimum: ${minWidth}x${minHeight}`,
      };
    }

    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        valid: false,
        error: `Image trop grande (${dimensions.width}x${dimensions.height}). Maximum: ${maxWidth}x${maxHeight}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Impossible de lire l\'image',
    };
  }
}

/**
 * Obtient les dimensions d'une image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calcule les statistiques d'une liste d'images
 */
export async function getImagesStats(files: File[]): Promise<{
  totalSize: number;
  totalSizeMB: number;
  averageSize: number;
  largestFile: File;
  smallestFile: File;
}> {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  return {
    totalSize,
    totalSizeMB: totalSize / 1024 / 1024,
    averageSize: totalSize / files.length,
    largestFile: files.reduce((largest, file) => file.size > largest.size ? file : largest),
    smallestFile: files.reduce((smallest, file) => file.size < smallest.size ? file : smallest),
  };
}
