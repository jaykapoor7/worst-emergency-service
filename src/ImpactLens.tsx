import { useEffect, useRef } from "react";

export default function ImpactLens({ x, y, label }: { x: number; y: number; label: string }) {
  const lens = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const target = lens.current;
    const source = document.querySelector<HTMLCanvasElement>(".world canvas");
    const context = target?.getContext("2d");
    if (!target || !source || !context) return;
    let frame = 0;
    const paint = () => {
      if (!document.hidden && source.width > 0 && source.height > 0) {
        const scaleX = source.width / 1000;
        const scaleY = source.height / 640;
        context.drawImage(
          source,
          Math.max(0, Math.min(690, x - 155)) * scaleX,
          Math.max(0, Math.min(495, y - 95)) * scaleY,
          310 * scaleX,
          145 * scaleY,
          0, 0, target.width, target.height,
        );
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [x, y]);
  return (
    <div className="impact-window">
      <canvas ref={lens} width={620} height={290} role="img" aria-label={`Live close-up of the town: ${label}`} />
      <span>AFTER · LIVE TOWN CAMERA</span>
      <b>CASE CLOSED*</b>
    </div>
  );
}
