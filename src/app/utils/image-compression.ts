export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
  initialQuality?: number;
  minQuality?: number;
  outputType?: 'image/webp' | 'image/jpeg';
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  maxBytes: 900 * 1024,
  initialQuality: 0.82,
  minQuality: 0.55,
  outputType: 'image/webp',
};

export function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil((base64.length * 3) / 4);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function compressImageFileToDataUrl(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<string> {
  if (file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }

  const config = { ...DEFAULT_OPTIONS, ...options };
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return readFileAsDataUrl(file);
  }

  const fitted = fitWithin(image.width, image.height, config.maxWidth, config.maxHeight);
  let bestDataUrl = '';
  let scale = 1;

  while (scale >= 0.55) {
    canvas.width = Math.max(1, Math.round(fitted.width * scale));
    canvas.height = Math.max(1, Math.round(fitted.height * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (config.outputType === 'image/jpeg') {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (let quality = config.initialQuality; quality >= config.minQuality; quality -= 0.08) {
      const dataUrl = canvas.toDataURL(config.outputType, Number(quality.toFixed(2)));
      bestDataUrl = dataUrl;
      if (estimateDataUrlBytes(dataUrl) <= config.maxBytes) {
        return dataUrl;
      }
    }

    scale -= 0.15;
  }

  return bestDataUrl || readFileAsDataUrl(file);
}

function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number): { width: number; height: number } {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen para comprimirla.'));
    };

    image.src = objectUrl;
  });
}
