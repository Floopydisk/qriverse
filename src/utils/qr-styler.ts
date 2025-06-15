import QRCode from "qrcode";

export interface QRStyleOptions {
  width?: number;
  margin?: number;
  darkColor: string;
  lightColor: string;
  template?: 'square' | 'circle' | 'rounded' | 'hexagon' | 'diamond' | 'scan-me';
  cornerRadius?: number;
}

export const generateStyledQR = async (
  content: string, 
  options: QRStyleOptions
): Promise<string> => {
  const { width = 400, margin = 2, darkColor, lightColor, template = 'square', cornerRadius = 20 } = options;
  
  if (template === 'scan-me') {
    return createScanMeTemplate(content, options);
  }

  // Generate base QR code
  const qrDataUrl = await QRCode.toDataURL(content, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'H' // Higher error correction for better logo integration
  });

  if (template === 'square') {
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
        
        switch (template) {
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

const createScanMeTemplate = async (content: string, options: QRStyleOptions): Promise<string> => {
  const { darkColor, lightColor } = options;
  const qrSize = 400;
  const bannerHeight = 80;
  const totalWidth = qrSize;
  const totalHeight = qrSize + bannerHeight;
  const padding = 20;
  const cornerRadius = 30;

  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw main background
  ctx.fillStyle = darkColor;
  drawRoundedRect(ctx, 0, 0, totalWidth, totalHeight, cornerRadius);
  ctx.fill();

  // Draw inner white background for QR
  ctx.fillStyle = lightColor;
  drawRoundedRect(ctx, padding, padding, totalWidth - padding * 2, totalWidth - padding * 2, cornerRadius / 2);
  ctx.fill();

  // Generate and draw QR code
  const qrDataUrl = await QRCode.toDataURL(content, {
    width: qrSize - padding * 4, // smaller qr code
    margin: 1,
    color: { dark: darkColor, light: "rgba(0,0,0,0)" }, // transparent light color
    errorCorrectionLevel: 'H'
  });

  await new Promise<void>(resolve => {
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, padding * 2, padding * 2);
      resolve();
    };
    qrImg.src = qrDataUrl;
  });
  
  // Draw "SCAN ME" text
  ctx.fillStyle = lightColor;
  ctx.font = `bold ${bannerHeight * 0.6}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCAN ME", totalWidth / 2, qrSize + bannerHeight / 2);
  
  return canvas.toDataURL("image/png");
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
  ctx.closePath();
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
