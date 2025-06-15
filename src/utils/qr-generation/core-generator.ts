
import React from 'react';
import { QRCode } from 'react-qrcode-logo';
import { QRStyleOptions, QRMappedStyle, QREyeStyle } from './types';
import { applyTemplateShape } from './canvas-helpers';
import { createScanMeTemplate } from './template-generators';

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
            
            // Apply template shapes if needed
            if (template !== 'square') {
              finalCanvas = applyTemplateShape(canvas, template, cornerRadius);
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
