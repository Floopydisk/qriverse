
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    type: 'linear' | 'radial';
    direction?: string;
    startColor: string;
    endColor: string;
  }
): CanvasGradient => {
  const { type, direction = '0deg', startColor, endColor } = options;

  let gradient: CanvasGradient;

  if (type === 'radial') {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) / 2;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  } else {
    // Linear gradient
    const angle = parseFloat(direction.replace('deg', '')) * (Math.PI / 180);
    
    // Calculate start and end points based on angle
    const centerX = width / 2;
    const centerY = height / 2;
    const diagonal = Math.sqrt(width * width + height * height) / 2;
    
    const startX = centerX - Math.cos(angle + Math.PI) * diagonal;
    const startY = centerY - Math.sin(angle + Math.PI) * diagonal;
    const endX = centerX - Math.cos(angle) * diagonal;
    const endY = centerY - Math.sin(angle) * diagonal;
    
    gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  }

  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  
  return gradient;
};

export const hexToRgba = (hex: string, opacity: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};
