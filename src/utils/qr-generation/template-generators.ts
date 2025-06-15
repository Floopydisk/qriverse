
import { QRStyleOptions } from './types';
import { drawRoundedRect } from './canvas-helpers';
import { generateStyledQR } from './core-generator';

export const createScanMeTemplate = async (
  content: string, 
  options: QRStyleOptions
): Promise<string> => {
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
