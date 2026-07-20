"use client";

import { useEffect, useRef, useState } from "react";
import type { Slide } from "@/data/slides";

const ZOOM_STEP = 0.4;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

export default function Lightbox({
  slide,
  onClose,
}: {
  slide: Slide;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => {
      const next = Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2));
      if (next === ZOOM_MIN) setPos({ x: 0, y: 0 });
      return next;
    });
  const zoomReset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= ZOOM_MIN || slide.type !== "image") return;
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="lightbox-viewport" onClick={(e) => e.stopPropagation()}>
        <div
          className={`lightbox-inner ${zoom > ZOOM_MIN ? "draggable" : ""}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {slide.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.src} alt={slide.title} className="lightbox-img" draggable={false} />
          ) : (
            <video
              src={slide.src}
              poster={slide.poster}
              controls
              autoPlay
              playsInline
              className="lightbox-video"
            />
          )}
        </div>
      </div>

      {slide.type === "image" && (
        <div className="zoom-bar" onClick={(e) => e.stopPropagation()}>
          <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="Zoom out">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="zoom-reset" onClick={zoomReset} aria-label="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="Zoom in">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <style jsx>{`
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(20, 15, 10, 0.92);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3vh 3vw;
          animation: fade-in 0.2s ease;
        }

        .lightbox-viewport {
          max-width: 100%;
          max-height: 100%;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-inner {
          display: flex;
          animation: pop-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: center center;
          touch-action: none;
        }

        .lightbox-inner.draggable {
          cursor: grab;
        }

        .lightbox-inner.draggable:active {
          cursor: grabbing;
        }

        .lightbox-img {
          max-width: 90vw;
          max-height: 88vh;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .lightbox-video {
          max-width: 90vw;
          max-height: 88vh;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .lightbox-close {
          position: absolute;
          top: calc(1.25rem + env(safe-area-inset-top));
          right: calc(1.25rem + env(safe-area-inset-right));
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f3ece0;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: rotate(90deg);
        }

        .zoom-bar {
          position: absolute;
          bottom: calc(1.5rem + env(safe-area-inset-bottom));
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 999px;
          padding: 0.4rem;
          backdrop-filter: blur(6px);
          animation: fade-in 0.3s ease 0.1s both;
        }

        .zoom-bar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #f3ece0;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .zoom-bar button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.18);
        }

        .zoom-bar button:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .zoom-reset {
          width: auto !important;
          min-width: 56px;
          padding: 0 0.6rem;
          font-size: 0.8rem;
          font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          border-radius: 999px !important;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pop-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lightbox,
          .lightbox-inner,
          .zoom-bar {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

