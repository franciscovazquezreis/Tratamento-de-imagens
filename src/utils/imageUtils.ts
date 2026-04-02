export async function compressImage(base64Str: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const MAX_DIMENSION = 2048;
      let width = img.width;
      let height = img.height;

      // Se a imagem já for pequena o suficiente, retorna a original
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(base64Str);
        return;
      }

      // Calcula as novas dimensões mantendo o aspect ratio
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Desenha a imagem redimensionada no canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Exporta como JPEG com qualidade 0.85
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      resolve(compressedBase64);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
}
