"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const TAU = Math.PI * 2;

type Point = {
  x: number;
  y: number;
};

type RoundedRectMetrics = {
  width: number;
  height: number;
  radius: number;
  horizontal: number;
  vertical: number;
  arc: number;
  perimeter: number;
};

function getRoundedRectMetrics(
  width: number,
  height: number,
  radius: number
): RoundedRectMetrics {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  const horizontal = Math.max(0, width - safeRadius * 2);
  const vertical = Math.max(0, height - safeRadius * 2);
  const arc = safeRadius * (Math.PI / 2);

  return {
    width,
    height,
    radius: safeRadius,
    horizontal,
    vertical,
    arc,
    perimeter: horizontal * 2 + vertical * 2 + arc * 4,
  };
}

function pointOnRoundedRect(distance: number, metrics: RoundedRectMetrics): Point {
  const { width, height, radius, horizontal, vertical, arc, perimeter } = metrics;
  const normalized = ((distance % perimeter) + perimeter) % perimeter;

  if (normalized <= horizontal) {
    return { x: radius + normalized, y: 0 };
  }

  if (normalized <= horizontal + arc) {
    const angle = -Math.PI / 2 + (normalized - horizontal) / radius;
    return {
      x: width - radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius,
    };
  }

  if (normalized <= horizontal + arc + vertical) {
    return {
      x: width,
      y: radius + (normalized - horizontal - arc),
    };
  }

  if (normalized <= horizontal + arc * 2 + vertical) {
    const angle = (normalized - horizontal - arc - vertical) / radius;
    return {
      x: width - radius + Math.cos(angle) * radius,
      y: height - radius + Math.sin(angle) * radius,
    };
  }

  if (normalized <= horizontal * 2 + arc * 2 + vertical) {
    return {
      x: width - radius - (normalized - horizontal - arc * 2 - vertical),
      y: height,
    };
  }

  if (normalized <= horizontal * 2 + arc * 3 + vertical) {
    const angle = Math.PI / 2 + (normalized - horizontal * 2 - arc * 2 - vertical) / radius;
    return {
      x: radius + Math.cos(angle) * radius,
      y: height - radius + Math.sin(angle) * radius,
    };
  }

  if (normalized <= horizontal * 2 + arc * 3 + vertical * 2) {
    return {
      x: 0,
      y: height - radius - (normalized - horizontal * 2 - arc * 3 - vertical),
    };
  }

  const angle = Math.PI + (normalized - horizontal * 2 - arc * 3 - vertical * 2) / radius;
  return {
    x: radius + Math.cos(angle) * radius,
    y: radius + Math.sin(angle) * radius,
  };
}

export function RainbowBorderCanvas({
  className,
  inset = 4,
  radius = 24,
}: {
  className?: string;
  inset?: number;
  radius?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    const draw = (timestamp = 0) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.round(width * dpr);
      const nextHeight = Math.round(height * dpr);

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const drawWidth = Math.max(width - inset * 2, 1);
      const drawHeight = Math.max(height - inset * 2, 1);
      const metrics = getRoundedRectMetrics(drawWidth, drawHeight, radius);
      const segments = Math.max(220, Math.round(metrics.perimeter / 4));
      const time = timestamp * 0.001;

      context.save();
      context.translate(inset, inset);
      context.lineCap = "round";
      context.lineJoin = "round";

      for (let pass = 0; pass < 2; pass++) {
        for (let index = 0; index < segments; index++) {
          const progress = index / segments;
          const startDistance = metrics.perimeter * progress;
          const endDistance = metrics.perimeter * ((index + 1) / segments);
          const from = pointOnRoundedRect(startDistance, metrics);
          const to = pointOnRoundedRect(endDistance, metrics);
          const hue = (progress * 360 + time * 36) % 360;
          const widthWave = 2.6 + Math.sin(progress * TAU * 5 - time * 1.3) * 1.1;
          const detailWave = 1.2 + Math.sin(progress * TAU * 13 + time * 2.1) * 0.8;

          context.strokeStyle = `hsla(${hue}, 100%, ${pass === 0 ? 72 : 68}%, ${pass === 0 ? 0.2 : 0.95})`;
          context.lineWidth = pass === 0 ? widthWave + detailWave + 3 : widthWave + detailWave;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }
      }

      context.restore();
    };

    const render = (timestamp: number) => {
      draw(timestamp);
      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;

      if (mediaQuery.matches) {
        draw();
        return;
      }

      frameId = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => {
      draw();
    });

    resizeObserver.observe(canvas);

    const handleMotionChange = () => {
      start();
    };

    start();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);

      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, [inset, radius]);

  return (
    <canvas
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      ref={canvasRef}
    />
  );
}
