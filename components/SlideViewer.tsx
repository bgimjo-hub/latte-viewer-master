"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Slide, SubType } from "@/data/slides";
import { categoryColors, subLabels } from "@/data/slides";
import Lightbox from "@/components/Lightbox";

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  const d = direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubIcon({ sub }: { sub: SubType }) {
  if (sub === "catalog") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
        <path
          d="M5 4h11l3 3v13H5V4z M16 4v4h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (sub === "catalogKr") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <text x="12" y="15.5" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontFamily="sans-serif">
          KR
        </text>
      </svg>
    );
  }
  if (sub === "pairing") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
        <path
          d="M7 3v7a2 2 0 002 2v9M7 3v7M9 3v7M17 3c-1.5 0-2 2-2 4s.5 5 2 5 2-3 2-5-.5-4-2-4zM17 12v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SlideViewer({ slides }: { slides: Slide[] }) {
  const [currentId, setCurrentId] = useState(slides[0]?.id ?? 1);
  const [navOpen, setNavOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const currentIndex = slides.findIndex((s) => s.id === currentId);
  const current = slides[currentIndex];
  const accent = (current.category && categoryColors[current.category]) || "#a8321f";

  const groups = useMemo(() => {
    const map = new Map<string, Slide[]>();
    for (const s of slides) {
      const key = s.category ?? "__cover__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [slides]);

  const categorySlides = useMemo(
    () => (current.category ? slides.filter((s) => s.category === current.category) : []),
    [slides, current.category]
  );

  const goTo = useCallback(
    (id: number) => {
      const targetIndex = slides.findIndex((s) => s.id === id);
      setDirection(targetIndex > currentIndex ? "forward" : "backward");
      setCurrentId(id);
      setNavOpen(false);
    },
    [slides, currentIndex]
  );

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("backward");
      setCurrentId(slides[currentIndex - 1].id);
    }
  }, [currentIndex, slides]);

  const goNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection("forward");
      setCurrentId(slides[currentIndex + 1].id);
    }
  }, [currentIndex, slides]);

  const touchState = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [swipeOffset, setSwipeOffset] = useState(0);

  const SWIPE_THRESHOLD = 60;

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (current.type === "video") return;
      const t = e.touches[0];
      touchState.current = { x: t.clientX, y: t.clientY, active: true };
      setSwipeOffset(0);
    },
    [current.type]
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current.active) return;
    const t = e.touches[0];
    const dx = t.clientX - touchState.current.x;
    const dy = t.clientY - touchState.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeOffset(dx);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchState.current.active) return;
    touchState.current.active = false;
    if (swipeOffset <= -SWIPE_THRESHOLD) {
      goNext();
    } else if (swipeOffset >= SWIPE_THRESHOLD) {
      goPrev();
    }
    setSwipeOffset(0);
  }, [swipeOffset, goNext, goPrev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, lightboxOpen]);

  if (!current) return null;

  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div className="shell" style={{ ["--accent" as string]: accent }}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <button className="nav-toggle" onClick={() => setNavOpen((v) => !v)} aria-label="Open menu">
        Menu
      </button>

      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <aside className={`sidebar ${navOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-eyebrow">1879</span>
          <h1>Latte Catalog</h1>
        </div>

        <nav className="toc">
          {groups.map(([key, items], gi) => (
            <div className="toc-group" key={key} style={{ animationDelay: `${gi * 0.05}s` }}>
              {key !== "__cover__" && (
                <div className="toc-label">
                  <span className="toc-dot" style={{ background: categoryColors[key] }} />
                  {key}
                </div>
              )}
              <ul>
                {items.map((s) => (
                  <li key={s.id}>
                    <button
                      className={`toc-item ${s.id === currentId ? "active" : ""}`}
                      onClick={() => goTo(s.id)}
                      style={
                        s.id === currentId
                          ? s.category
                            ? { background: categoryColors[s.category], boxShadow: `0 4px 14px ${categoryColors[s.category]}55` }
                            : { background: "var(--ink)", boxShadow: "0 4px 14px rgba(42, 35, 28, 0.3)" }
                          : undefined
                      }
                    >
                      {s.sub ? <SubIcon sub={s.sub} /> : <span className="toc-num">01</span>}
                      <span className="toc-title">{s.sub ? subLabels[s.sub] : s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="viewer">
        <div className="viewer-top">
          <span className="counter" key={currentIndex}>
            {String(currentIndex + 1).padStart(2, "0")} / {slides.length}
          </span>
        {current.category && <h2 className="drink-name">{current.category}</h2>}
        </div>

        <div
          className="stage"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            key={current.id}
            className={`stage-content ${direction}`}
            style={swipeOffset !== 0 ? { transform: `translateX(${swipeOffset}px)`, transition: "none" } : undefined}
          >
            {current.type === "image" ? (
              <Image
                src={current.src}
                alt={current.title}
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                style={{ objectFit: "contain" }}
                quality={100}
                unoptimized
                priority
              />
            ) : (
              <video
                src={current.src}
                poster={current.poster}
                controls
                playsInline
                className="stage-video"
              />
            )}
          </div>

          <button className="expand-btn" onClick={() => setLightboxOpen(true)} aria-label="View larger">
            <ExpandIcon />
          </button>
        </div>

        <div className="controls">
          {categorySlides.length > 0 && (
            <div className="quick-tabs">
              {categorySlides.map((s) => (
                <button
                  key={s.id}
                  className={`quick-tab ${s.id === currentId ? "active" : ""}`}
                  onClick={() => goTo(s.id)}
                  style={s.id === currentId ? { background: accent, borderColor: accent } : undefined}
                >
                  {s.sub && <SubIcon sub={s.sub} />}
                  {s.sub && subLabels[s.sub]}
                </button>
              ))}
            </div>
          )}

          <div className="arrow-group">
            <button className="arrow-btn" onClick={goPrev} disabled={currentIndex === 0} aria-label="Previous slide">
              <ArrowIcon direction="prev" />
            </button>
            <button
              className="arrow-btn"
              onClick={goNext}
              disabled={currentIndex === slides.length - 1}
              aria-label="Next slide"
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        </div>
      </main>

      {lightboxOpen && <Lightbox slide={current} onClose={() => setLightboxOpen(false)} />}

      <style jsx>{`
        .shell {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        .progress-track {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(42, 35, 28, 0.08);
          z-index: 30;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease;
        }

        .nav-toggle {
          display: none;
        }

        .scrim {
          display: none;
        }

        .sidebar {
          width: var(--sidebar-w);
          flex-shrink: 0;
          background: var(--cream-dark);
          border-right: 1px solid var(--line);
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          padding: 2.75rem 1.75rem 2.5rem;
          animation: slide-in-left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .brand {
          margin-bottom: 2.75rem;
          animation: fade-up 0.5s ease both;
        }

        .brand-eyebrow {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          color: var(--red);
          font-size: 2.4rem;
          letter-spacing: 0.06em;
          display: block;
          line-height: 1;
        }

        .brand h1 {
          font-family: "DM Serif Display", serif;
          font-size: 1.6rem;
          margin: 0.35rem 0 0;
          font-weight: 400;
          color: var(--ink);
        }

        .toc-group {
          margin-bottom: 1.9rem;
          animation: fade-up 0.45s ease both;
        }

        .toc-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: "Cormorant Garamond", serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink);
          margin: 0 0 0.65rem 0.9rem;
        }

        .toc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
        }

        .toc-group ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .toc-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 0.55rem 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--ink-soft);
          font-family: "Noto Sans KR", sans-serif;
          font-size: 0.92rem;
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }

        .toc-item:hover {
          background: rgba(42, 35, 28, 0.06);
          transform: translateX(2px);
        }

        .toc-item.active {
          color: var(--cream);
        }

        .toc-num {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.15rem;
          font-weight: 600;
          opacity: 0.75;
          width: 1.4rem;
          flex-shrink: 0;
        }

        .toc-title {
          flex: 1;
        }

        .viewer {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 3rem 3rem 2.5rem;
          min-width: 0;
        }

        .viewer-top {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          margin-bottom: 0.6rem;
        }

        .counter {
          font-family: "Cormorant Garamond", serif;
          font-size: 2.1rem;
          font-weight: 600;
          color: var(--accent);
          animation: pop 0.3s ease;
          transition: color 0.3s ease;
        }

        .drink-name {
          font-family: "DM Serif Display", serif;
          font-weight: 400;
          font-size: 1.7rem;
          margin: 0;
          color: var(--ink);
          animation: fade-up 0.35s ease both;
        }

        .quick-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .quick-tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink-soft);
          font-size: 0.82rem;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .quick-tab:hover {
          transform: translateY(-1px);
        }

        .quick-tab.active {
          color: var(--cream);
        }

        .stage {
          position: relative;
          flex: 1;
          min-height: 420px;
          background: #fff;
          border: 1px solid var(--line);
          border-top: 3px solid var(--accent);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 44px rgba(42, 35, 28, 0.1);
          transition: border-color 0.3s ease;
          touch-action: pan-y;
        }

        .stage-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage-content.forward {
          animation: enter-forward 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .stage-content.backward {
          animation: enter-backward 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .stage-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        .expand-btn {
          position: absolute;
          right: 1rem;
          top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(42, 35, 28, 0.78);
          color: var(--cream);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          backdrop-filter: blur(3px);
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .expand-btn:hover {
          background: var(--accent);
          transform: translateY(-2px);
        }

        .controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .arrow-group {
          display: flex;
          gap: 0.75rem;
          margin-left: auto;
        }

        .arrow-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 92px;
          height: 46px;
          background: transparent;
          border: 1px solid var(--ink);
          border-radius: 999px;
          cursor: pointer;
          color: var(--ink);
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease,
            border-color 0.18s ease;
        }

        .arrow-btn:hover:not(:disabled) {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--cream);
          transform: scale(1.06);
        }

        .arrow-btn:active:not(:disabled) {
          transform: scale(0.96);
        }

        .arrow-btn:disabled {
          opacity: 0.25;
          cursor: default;
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes enter-forward {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes enter-backward {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 900px) {
          .nav-toggle {
            display: block;
            position: fixed;
            top: calc(1rem + env(safe-area-inset-top));
            left: calc(1rem + env(safe-area-inset-left));
            z-index: 20;
            background: var(--accent);
            color: var(--cream);
            border: none;
            padding: 0.55rem 1rem;
            border-radius: 999px;
            font-size: 0.85rem;
            box-shadow: 0 4px 14px rgba(42, 35, 28, 0.25);
          }

          .scrim {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            z-index: 14;
            animation: fade-up 0.2s ease;
          }

          .sidebar {
            position: fixed;
            left: -100%;
            top: 0;
            z-index: 15;
            transition: left 0.25s ease;
            width: 84vw;
            max-width: 320px;
            box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
            padding: calc(2rem + env(safe-area-inset-top)) 1.5rem 2rem;
          }

          .sidebar.open {
            left: 0;
          }

          .viewer {
            padding: calc(4.25rem + env(safe-area-inset-top)) 1.1rem
              calc(1.5rem + env(safe-area-inset-bottom));
          }

          .viewer-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
            margin-bottom: 0.9rem;
          }

          .counter {
            font-size: 1.5rem;
          }

          .drink-name {
            font-size: 1.2rem;
          }

          .stage {
            min-height: 46vh;
          }

          .expand-btn {
            width: 40px;
            height: 40px;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-top: 1rem;
          }

          .quick-tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 2px;
          }

          .quick-tabs::-webkit-scrollbar {
            display: none;
          }

          .quick-tab {
            flex-shrink: 0;
          }

          .arrow-group {
            margin-left: 0;
            justify-content: space-between;
          }

          .arrow-btn {
            flex: 1;
            width: auto;
          }
        }

        @media (max-width: 420px) {
          .brand-eyebrow {
            font-size: 2rem;
          }

          .brand h1 {
            font-size: 1.4rem;
          }

          .counter {
            font-size: 1.3rem;
          }

          .drink-name {
            font-size: 1.05rem;
          }

          .stage {
            min-height: 40vh;
          }

          .quick-tab {
            padding: 0.4rem 0.8rem;
            font-size: 0.76rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar,
          .brand,
          .toc-group,
          .counter,
          .drink-name,
          .quick-tabs,
          .stage-content,
          .scrim {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
