
import QRCode from "qrcode";

export interface QRShapeOptions {
  width?: number;
  margin?: number;
  darkColor: string;
  lightColor: string;
  shape?: 'square' | 'circle' | 'rounded' | 'hexagon' | 'diamond';
  cornerRadius?: number;
}

export const generateShapedQR = async (
  content: string, 
  options: QRShapeOptions
): Promise<string> => {
  const { width = 400, margin = 2, darkColor, lightColor, shape = 'square', cornerRadius = 20 } = options;
  
  // Generate base QR code
  const qrDataUrl = await QRCode.toDataURL(content, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  if (shape === 'square') {
    return qrDataUrl;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Create clipping path based on shape
        ctx.save();
        
        switch (shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, 2 * Math.PI);
            ctx.clip();
            break;
            
          case 'rounded':
            drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, cornerRadius);
            ctx.clip();
            break;
            
          case 'hexagon':
            drawHexagon(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2.2);
            ctx.clip();
            break;
            
          case 'diamond':
            drawDiamond(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2.2);
            ctx.clip();
            break;
        }
        
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }
      
      resolve(canvas.toDataURL("image/png"));
    };
    
    img.src = qrDataUrl;
  });
};

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
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
};

const drawHexagon = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

const drawDiamond = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX + radius, centerY);
  ctx.lineTo(centerX, centerY + radius);
  ctx.lineTo(centerX - radius, centerY);
  ctx.closePath();
};
