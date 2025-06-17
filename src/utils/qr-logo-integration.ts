
export interface LogoIntegrationOptions {
  logoSize?: number;
  preserveAspectRatio?: boolean;
  logoStyle?: 'overlay' | 'integrated' | 'background';
  padding?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export const integrateLogoIntoQR = async (
  qrDataUrl: string,
  logoDataUrl: string,
  options: LogoIntegrationOptions = {}
): Promise<string> => {
  const {
    logoSize = 0.25,
    preserveAspectRatio = true,
    logoStyle = 'integrated',
    padding = 8,
    borderRadius = 8,
    borderColor = '#FFFFFF',
    borderWidth = 4
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImg = new Image();
    
    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      // Draw QR code background
      ctx.drawImage(qrImg, 0, 0);
      
      const logoImg = new Image();
      logoImg.onload = () => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Calculate logo dimensions
        let logoWidth, logoHeight;
        
        if (preserveAspectRatio) {
          const maxSize = Math.min(canvas.width, canvas.height) * logoSize;
          const aspectRatio = logoImg.width / logoImg.height;
          
          if (logoImg.width > logoImg.height) {
            logoWidth = maxSize;
            logoHeight = maxSize / aspectRatio;
          } else {
            logoHeight = maxSize;
            logoWidth = maxSize * aspectRatio;
          }
        } else {
          logoWidth = logoHeight = Math.min(canvas.width, canvas.height) * logoSize;
        }
        
        const logoX = centerX - logoWidth / 2;
        const logoY = centerY - logoHeight / 2;
        
        if (logoStyle === 'integrated' || logoStyle === 'overlay') {
          // Create background for logo
          ctx.save();
          
          // Draw rounded background
          ctx.fillStyle = borderColor;
          const bgX = logoX - padding - borderWidth;
          const bgY = logoY - padding - borderWidth;
          const bgWidth = logoWidth + (padding + borderWidth) * 2;
          const bgHeight = logoHeight + (padding + borderWidth) * 2;
          
          drawRoundedBackground(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
          ctx.fill();
          
          // Add border if specified
          if (borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.stroke();
          }
          
          ctx.restore();
        }
        
        if (logoStyle === 'background') {
          // Apply logo as subtle background pattern
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          ctx.restore();
        } else {
          // Draw logo on top
          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        }
        
        resolve(canvas.toDataURL("image/png"));
      };
      
      logoImg.src = logoDataUrl;
    };
    
    qrImg.src = qrDataUrl;
  });
};

const drawRoundedBackground = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};
