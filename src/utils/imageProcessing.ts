
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

interface CropPosition {
  x: number;
  y: number;
}

export const cropImage = async (
  imageSrc: string,
  width: number,
  height: number,
  manualPosition?: CropPosition
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Calculate scaling to maintain aspect ratio
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  
  // Calculate positioning
  let x, y;
  if (manualPosition) {
    // Convert percentage to actual position
    const maxX = width - scaledWidth;
    const maxY = height - scaledHeight;
    x = (maxX * manualPosition.x) / 100;
    y = (maxY * manualPosition.y) / 100;
  } else {
    // Center the image
    x = (width - scaledWidth) / 2;
    y = (height - scaledHeight) / 2;
  }

  canvas.width = width;
  canvas.height = height;

  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  return canvas.toDataURL('image/jpeg', 0.95);
};

export const verifyDimensions = async (
  imageSrc: string,
  expectedWidth: number,
  expectedHeight: number
): Promise<{ isCorrect: boolean; actualWidth: number; actualHeight: number }> => {
  const image = await createImage(imageSrc);
  
  // Create a temporary canvas to get actual dimensions
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Draw image to get actual dimensions
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  // Allow for 1px difference due to rounding
  const isCorrect = 
    Math.abs(image.width - expectedWidth) <= 1 && 
    Math.abs(image.height - expectedHeight) <= 1;

  return {
    isCorrect,
    actualWidth: image.width,
    actualHeight: image.height
  };
};
