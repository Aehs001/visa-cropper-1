
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const cropImage = async (
  imageSrc: string,
  width: number,
  height: number
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
  
  // Calculate positioning to center the image
  const x = (width - scaledWidth) / 2;
  const y = (height - scaledHeight) / 2;

  canvas.width = width;
  canvas.height = height;

  // Optional: Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  return canvas.toDataURL('image/jpeg', 0.95);
};
