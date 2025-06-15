import React from 'react';
import { QRCode } from 'react-qrcode-logo';
import { QRStyleOptions, QRMappedStyle, QREyeStyle } from './types';
import { applyTemplateShape } from './canvas-helpers';
import { createScanMeTemplate } from './template-generators';
import { createGradient, hexToRgba } from './gradient-helpers';

const mapPatternToQRStyle = (pattern: string): { qrStyle: QRMappedStyle; eyeStyle: QREyeStyle } => {
  switch (pattern) {
    case 'circle':
    case 'dots':
      return { qrStyle: 'dots', eyeStyle: 'circle' };
    case 'fluid':
      return { qrStyle: 'fluid', eyeStyle: 'square' };
    case 'rounded':
      return { qrStyle: 'squares', eyeStyle: 'square' };
    default:
      return { qrStyle: 'squares', eyeStyle: 'square' };
  }
};

const applyGradientAndTransparency = (
  canvas: HTMLCanvasElement,
  options: QRStyleOptions
): HTMLCanvasElement => {
  const { 
    useGradient, 
    gradientType = 'linear', 
    gradientDirection = '0deg',
    gradientStartColor = '#000000',
    gradientEndColor = '#666666',
    gradientTarget = 'foreground',
    backgroundTransparent = false,
    foregroundTransparent = false,
    backgroundOpacity = 100,
    foregroundOpacity = 100,
    darkColor,
    lightColor
  } = options;

  if (!useGradient && !backgroundTransparent && !foregroundTransparent && backgroundOpacity === 100 && foregroundOpacity === 100) {
    return canvas;
  }

  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  if (!ctx) return canvas;

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  // Get image data from original canvas
  const originalCtx = canvas.getContext('2d');
  if (!originalCtx) return canvas;
  
  const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert colors to RGB for comparison
  const darkRgb = hexToRgb(darkColor);
  const lightRgb = hexToRgb(lightColor);

  // Apply gradient or transparency effects
  if (useGradient && gradientTarget === 'background') {
    // Create gradient for background
    const gradient = createGradient(ctx, canvas.width, canvas.height, {
      type: gradientType,
      direction: gradientDirection,
      startColor: gradientStartColor,
      endColor: gradientEndColor
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw foreground pixels on top
    ctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    
    // Redraw only the dark pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (isDarkPixel(r, g, b, darkRgb)) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        ctx.fillStyle = foregroundTransparent ? 'transparent' : hexToRgba(darkColor, foregroundOpacity);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  } else if (useGradient && gradientTarget === 'foreground') {
    // Draw background first
    ctx.fillStyle = backgroundTransparent ? 'transparent' : hexToRgba(lightColor, backgroundOpacity);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient for foreground
    const gradient = createGradient(ctx, canvas.width, canvas.height, {
      type: gradientType,
      direction: gradientDirection,
      startColor: gradientStartColor,
      endColor: gradientEndColor
    });
    
    // Draw gradient and use original image as mask
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    
    // Create a mask from dark pixels
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isDarkPixel(r, g, b, darkRgb)) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          maskCtx.fillStyle = foregroundTransparent ? 'transparent' : `rgba(255, 255, 255, ${foregroundOpacity / 100})`;
          maskCtx.fillRect(x, y, 1, 1);
        }
      }
      
      ctx.drawImage(maskCanvas, 0, 0);
    }
  } else {
    // Just apply transparency without gradients
    if (backgroundTransparent) {
      // Make background transparent, keep only dark pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (!isDarkPixel(r, g, b, darkRgb)) {
          data[i + 3] = 0; // Make transparent
        } else if (foregroundTransparent) {
          data[i + 3] = 0; // Make foreground transparent too
        } else if (foregroundOpacity < 100) {
          data[i + 3] = Math.round((foregroundOpacity / 100) * 255);
        }
      }
    } else if (foregroundTransparent) {
      // Make foreground transparent, keep background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isDarkPixel(r, g, b, darkRgb)) {
          data[i + 3] = 0; // Make transparent
        } else if (backgroundOpacity < 100) {
          data[i + 3] = Math.round((backgroundOpacity / 100) * 255);
        }
      }
    } else {
      // Apply opacity to both
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isDarkPixel(r, g, b, darkRgb)) {
          data[i + 3] = Math.round((foregroundOpacity / 100) * 255);
        } else {
          data[i + 3] = Math.round((backgroundOpacity / 100) * 255);
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  return newCanvas;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const isDarkPixel = (r: number, g: number, b: number, darkRgb: { r: number; g: number; b: number }) => {
  const threshold = 50;
  return Math.abs(r - darkRgb.r) < threshold && 
         Math.abs(g - darkRgb.g) < threshold && 
         Math.abs(b - darkRgb.b) < threshold;
};

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
    eyeRadius = 0
  } = options;
  
  if (template === 'scan-me') {
    return createScanMeTemplate(content, options);
  }

  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const { qrStyle, eyeStyle } = mapPatternToQRStyle(pattern || 'square');

    const qrProps = {
      value: content,
      size: width,
      bgColor: lightColor,
      fgColor: darkColor,
      eyeColor: eyeColor,
      eyeRadius: eyeRadius,
      qrStyle: qrStyle,
      eyeStyle: eyeStyle,
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
        React.createElement(QRCode, qrProps)
      );

      // Wait for the component to render and then find the canvas
      setTimeout(() => {
        try {
          const canvas = tempDiv.querySelector('canvas') as HTMLCanvasElement;
          if (canvas) {
            let finalCanvas = canvas;
            
            // Apply gradient and transparency effects
            finalCanvas = applyGradientAndTransparency(finalCanvas, options);
            
            // Apply template shapes if needed
            if (template !== 'square') {
              finalCanvas = applyTemplateShape(finalCanvas, template, cornerRadius);
            }
            
            const dataUrl = finalCanvas.toDataURL("image/png");
            document.body.removeChild(container);
            resolve(dataUrl);
          } else {
            console.error("Canvas not found in QR code component");
            document.body.removeChild(container);
            resolve("");
          }
        } catch (error) {
          console.error("Error generating QR code:", error);
          document.body.removeChild(container);
          resolve("");
        }
      }, 200); // Increased timeout to ensure rendering is complete
    });
  });
};
