
import React from 'react';
import { QRCode } from 'react-qrcode-logo';

export interface QRStyleOptions {
  width?: number;
  margin?: number;
  darkColor: string;
  lightColor: string;
  eyeColor?: string;
  pattern?: 'square' | 'circle' | 'rounded' | 'diamond' | 'hexagon' | 'star' | 'dots' | 'fluid';
  template?: 'square' | 'circle' | 'rounded' | 'hexagon' | 'diamond' | 'scan-me';
  cornerRadius?: number;
  eyeRadius?: number;
  qrStyle?: 'squares' | 'dots' | 'fluid';
  eyeStyle?: 'square' | 'circle';
}

export const generateStyledQR = async (
  content: string, 
  options: QRStyleOptions
): Promise<string> => {
  const { 
    width = 400, 
    margin = 2, 
    darkColor, 
    lightColor, 
    eyeColor = darkColor,
    pattern = 'square',
    template = 'square', 
    cornerRadius = 20,
    eyeRadius = 0,
    qrStyle = 'squares',
    eyeStyle = 'square'
  } = options;
  
  if (template === 'scan-me') {
    return createScanMeTemplate(content, options);
  }

  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    // Map pattern to qrStyle for react-qrcode-logo
    let mappedQrStyle: 'squares' | 'dots' | 'fluid' = 'squares';
    let mappedEyeStyle: 'square' | 'circle' = 'square';
    
    switch (pattern) {
      case 'circle':
      case 'dots':
        mappedQrStyle = 'dots';
        mappedEyeStyle = 'circle';
        break;
      case 'fluid':
        mappedQrStyle = 'fluid';
        break;
      case 'rounded':
        mappedEyeStyle = 'square';
        break;
      default:
        mappedQrStyle = 'squares';
        mappedEyeStyle = 'square';
    }

    const qrProps = {
      value: content,
      size: width,
      bgColor: lightColor,
      fgColor: darkColor,
      eyeColor: eyeColor,
      eyeRadius: eyeRadius,
      qrStyle: mappedQrStyle,
      eyeStyle: mappedEyeStyle,
      quietZone: margin * 4,
      ecLevel: 'H' as const,
      enableCORS: true
    };

    // Create a temporary React component to render the QR code
    const tempDiv = document.createElement("div");
    container.appendChild(tempDiv);

    // Use the QRCode component directly
    import('react-dom/client').then(ReactDOM => {
      const root = ReactDOM.createRoot(tempDiv);
      
      root.render(
        React.createElement(QRCode, {
          ...qrProps,
          ref: (canvas: HTMLCanvasElement) => {
            if (canvas) {
              setTimeout(() => {
                try {
                  let finalCanvas = canvas;
                  
                  // Apply template shapes if needed
                  if (template !== 'square') {
                    finalCanvas = applyTemplateShape(canvas, template, cornerRadius);
                  }
                  
                  const dataUrl = finalCanvas.toDataURL("image/png");
                  document.body.removeChild(container);
                  resolve(dataUrl);
                } catch (error) {
                  console.error("Error generating QR code:", error);
                  document.body.removeChild(container);
                  resolve("");
                }
              }, 100);
            }
          }
        })
      );
    });
  });
};

const applyTemplateShape = (
  sourceCanvas: HTMLCanvasElement,
  template: string,
  cornerRadius: number
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  
  if (ctx) {
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
    
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.restore();
  }
  
  return canvas;
};

const createScanMeTemplate = async (content: string, options: QRStyleOptions): Promise<string> => {
  const { darkColor, lightColor, eyeColor, pattern } = options;
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

  // Generate QR code using react-qrcode-logo
  const qrDataUrl = await generateStyledQR(content, {
    width: qrSize - padding * 4,
    darkColor,
    lightColor: "rgba(0,0,0,0)",
    eyeColor,
    pattern,
    template: 'square'
  });

  // Draw the QR code on the canvas
  const qrImg = new Image();
  await new Promise<void>(resolve => {
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
