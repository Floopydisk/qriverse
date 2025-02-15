
import { useEffect, useRef } from "react";

const FloatingCircles = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const circles: HTMLDivElement[] = [];
    const numberOfCircles = 15;

    for (let i = 0; i < numberOfCircles; i++) {
      const circle = document.createElement("div");
      circle.className = "circle";
      circle.style.width = `${Math.random() * 300 + 100}px`;
      circle.style.height = circle.style.width;
      circle.style.left = `${Math.random() * 100}%`;
      circle.style.top = `${Math.random() * 100}%`;
      circle.style.animationDelay = `${Math.random() * 5}s`;
      circles.push(circle);
      container.appendChild(circle);
    }

    return () => {
      circles.forEach(circle => circle.remove());
    };
  }, []);

  return <div ref={containerRef} className="floating-circles" />;
};

export default FloatingCircles;
