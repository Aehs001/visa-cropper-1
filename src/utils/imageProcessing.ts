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
  scale: number;
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

  const padding = 40; // Padding for guidelines
  canvas.width = width + (padding * 2);
  canvas.height = height + (padding * 2);

  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (manualPosition) {
    const scale = manualPosition.scale || 1;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    ctx.drawImage(
      image,
      manualPosition.x + padding,
      manualPosition.y + padding,
      scaledWidth,
      scaledHeight,
      padding,
      padding,
      width,
      height
    );
  } else {
    const scale = Math.max(width / image.width, height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = ((width - scaledWidth) / 2) + padding;
    const y = ((height - scaledHeight) / 2) + padding;
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }

  // Draw measurement lines and labels
  ctx.strokeStyle = '#22C55E'; // Green color
  ctx.lineWidth = 1;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#22C55E';

  // Height measurement (left side)
  ctx.beginPath();
  ctx.moveTo(padding - 10, padding);
  ctx.lineTo(padding - 10, padding + height);
  
  // Height arrows
  ctx.moveTo(padding - 15, padding);
  ctx.lineTo(padding - 10, padding);
  ctx.lineTo(padding - 5, padding);
  
  ctx.moveTo(padding - 15, padding + height);
  ctx.lineTo(padding - 10, padding + height);
  ctx.lineTo(padding - 5, padding + height);
  
  ctx.stroke();

  // Width measurement (top)
  ctx.beginPath();
  ctx.moveTo(padding, padding - 10);
  ctx.lineTo(padding + width, padding - 10);
  
  // Width arrows
  ctx.moveTo(padding, padding - 15);
  ctx.lineTo(padding, padding - 10);
  ctx.lineTo(padding, padding - 5);
  
  ctx.moveTo(padding + width, padding - 15);
  ctx.lineTo(padding + width, padding - 10);
  ctx.lineTo(padding + width, padding - 5);
  
  ctx.stroke();

  // Add measurements text
  ctx.save();
  ctx.translate(padding - 25, padding + (height / 2));
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText(`${height}px`, 0, 0);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillText(`${width}px`, padding + (width / 2), padding - 25);

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
