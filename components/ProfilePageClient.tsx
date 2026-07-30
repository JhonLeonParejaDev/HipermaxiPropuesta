"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface ProfilePageClientProps {
  initials: string;
  fullName: string | null;
  email: string;
  memberSince: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const BADGES = [
  { id: "eco", emoji: "🌿", title: "Eco-Comprador", desc: "Elegiste productos sostenibles mas de 10 veces", gradFrom: "#4ade80", gradTo: "#059669", glowColor: "rgba(16,185,129,0.4)", unlocked: true },
  { id: "deals", emoji: "🏷️", title: "Maestro Ofertas", desc: "Mas de 20 descuentos aprovechados", gradFrom: "#fb923c", gradTo: "#d97706", glowColor: "rgba(249,115,22,0.4)", unlocked: true },
  { id: "loyalty", emoji: "⭐", title: "Cliente VIP", desc: "Miembro fiel por mas de 1 anio", gradFrom: "#facc15", gradTo: "#d97706", glowColor: "rgba(234,179,8,0.4)", unlocked: true },
  { id: "fresh", emoji: "🥦", title: "Amante Fresco", desc: "Mas de 15 pedidos con frutas y verduras", gradFrom: "#a3e635", gradTo: "#16a34a", glowColor: "rgba(132,204,22,0.4)", unlocked: false },
  { id: "speed", emoji: "⚡", title: "Compra Rapida", desc: "Pedido completado en menos de 3 min", gradFrom: "#38bdf8", gradTo: "#0284c7", glowColor: "rgba(56,189,248,0.4)", unlocked: false },
];

const HIGHLIGHTS = [
  { id: 1, label: "Tabla de quesos", src: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🧀", fallbackColor: "#fef3c7" },
  { id: 2, label: "Queso artesanal", src: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🥛", fallbackColor: "#f0fdf4" },
  { id: 3, label: "Whiskey Premium", src: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🥃", fallbackColor: "#fef9c3" },
  { id: 4, label: "Higos frescos", src: "https://images.unsplash.com/photo-1519462280764-60b4d2d65bf8?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🍇", fallbackColor: "#fdf4ff" },
  { id: 5, label: "Citricos frescos", src: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🍊", fallbackColor: "#fff7ed" },
  { id: 6, label: "Wagyu premium", src: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=380&h=260&fit=crop&q=80", fallbackEmoji: "🥩", fallbackColor: "#fff1f2" },
];

const MOMENTS = [
  { id: 1, src: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&h=160&fit=crop&q=80", emoji: "🛒", gradFrom: "#f97316", gradTo: "#f59e0b", label: "Compra semanal" },
  { id: 2, src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=160&fit=crop&q=80", emoji: "🥗", gradFrom: "#22c55e", gradTo: "#84cc16", label: "Plato saludable" },
  { id: 3, src: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=200&h=160&fit=crop&q=80", emoji: "🍗", gradFrom: "#f43f5e", gradTo: "#ec4899", label: "Oferta especial" },
];

const RECIPE_IMG = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=280&fit=crop&q=80";
const INGREDIENTS = [
  { name: "Pollo entero", href: "/categoria/carnes", icon: "🍗" },
  { name: "Papa", href: "/categoria/frutas-verduras", icon: "🥔" },
  { name: "Zanahoria", href: "/categoria/frutas-verduras", icon: "🥕" },
  { name: "Cebolla", href: "/categoria/abarrotes", icon: "🧅" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────

function useProfileStyles() {
  useEffect(() => {
    const id = "hp-profile-v3";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes hpSpin  { to { transform: rotate(360deg); } }
      @keyframes hpPulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.1)} }
      @keyframes hpSlide { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes hpBounce{ 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
      @keyframes hpWave  { from{transform:scaleY(1)} to{transform:scaleY(2)} }
      @keyframes hpNode  { 0%,100%{opacity:.15} 50%{opacity:.5} }
      @keyframes hpFadeUp{ from{opacity:0;transform:translateX(-50%) translateY(6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    `;
    document.head.appendChild(s);
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
}

// ─── Window Width Hook ────────────────────────────────────────────────────────

function useWindowWidth() {
  const [width, setWidth] = useState(0);
  const update = useCallback(() => setWidth(window.innerWidth), []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  return width;
}

// ─── Animated Canvas Particles ────────────────────────────────────────────────

function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; va: number };
    const COUNT = 38;
    let pts: P[] = [];

    function init() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width = W;
      canvas!.height = H;
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        r: 1.5 + Math.random() * 2,
        a: 0.2 + Math.random() * 0.5,
        va: (Math.random() - 0.5) * 0.004,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.a < 0.1 || p.a > 0.8) p.va *= -1;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(249,115,22,${(1 - dist / 110) * 0.22})`;
            ctx!.lineWidth = 0.8;
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(249,115,22,${p.a})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    const ro = new ResizeObserver(() => init());
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}

// ─── Animated Avatar ──────────────────────────────────────────────────────────

function AnimatedAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative mx-auto flex-shrink-0" style={{ width: 90, height: 90 }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: -4, borderRadius: "9999px", background: "conic-gradient(from 0deg,#f97316,#fbbf24,#ea580c,transparent 60%,#f97316)", animation: "hpSpin 5s linear infinite" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: -10, borderRadius: "9999px", background: "radial-gradient(circle,rgba(249,115,22,.4) 0%,transparent 70%)", animation: "hpPulse 3s ease-in-out infinite" }} />
      {["⭐", "🏷️", "❤️"].map((ico, i) => (
        <div key={i} aria-hidden="true" style={{
          position: "absolute", top: "50%", left: "50%", width: 20, height: 20, marginTop: -10, marginLeft: -10,
          borderRadius: "9999px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
          transform: `rotate(${i * 120}deg) translateX(54px) rotate(-${i * 120}deg)`,
          animation: `hpSpin ${6 + i * 1.5}s linear infinite`,
        }}>{ico}</div>
      ))}
      <div style={{
        position: "relative", zIndex: 2, width: 90, height: 90, borderRadius: "9999px",
        background: "linear-gradient(135deg,#f97316,#ea580c)",
        boxShadow: "0 0 28px rgba(249,115,22,.55),0 8px 24px rgba(0,0,0,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "#fff",
      }}>{initials}</div>
    </div>
  );
}

// ─── Side Card ────────────────────────────────────────────────────────────────

function SideCard({ href, title, description, stat, accentHex, svgContent, darkMode = false }: {
  href: string; title: string; description: string; stat: string; accentHex: string; svgContent: string; darkMode?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  const handleEnter = () => {
    setHov(true);
    setShimmer(true);
    setTimeout(() => setShimmer(false), 600);
  };

  return (
    <Link href={href}
      className={`group relative flex flex-col rounded-2xl border p-4 cursor-pointer overflow-hidden transition-colors duration-200 ${darkMode ? "bg-[#182234]" : "bg-white"
        }`}
      style={{
        borderColor: hov
          ? `${accentHex}66`
          : darkMode
            ? "rgba(51,65,85,0.6)"
            : "#f1f5f9",
        boxShadow: hov
          ? `0 16px 40px rgba(0,0,0,.25), 0 2px 14px ${accentHex}35, inset 0 0 0 1px ${accentHex}33`
          : darkMode
            ? "0 4px 20px rgba(0,0,0,.3)"
            : "0 2px 8px rgba(0,0,0,.06)",
        transition: "box-shadow .3s ease, border-color .3s ease, transform .2s ease",
        transform: hov ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
      }}
      onMouseEnter={handleEnter} onMouseLeave={() => setHov(false)}
    >
      {/* Shimmer sweep on enter */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: `linear-gradient(105deg, transparent 40%, ${accentHex}22 50%, transparent 60%)`,
        transform: shimmer ? "translateX(200%)" : "translateX(-200%)",
        transition: shimmer ? "transform .55s ease" : "none",
      }} aria-hidden="true" />

      {/* Top accent bar */}
      <div style={{
        height: 3, borderRadius: 4,
        background: `linear-gradient(90deg,${accentHex},${accentHex}66)`,
        width: hov ? "100%" : "40%",
        opacity: hov ? 1 : 0.45,
        transition: "width .35s ease, opacity .2s",
        marginBottom: 12,
      }} />

      {/* Icon */}
      <div className="relative z-10 mx-auto mb-3"
        style={{
          width: 72, height: 72,
          transform: hov ? "scale(1.15) rotate(-6deg)" : "scale(1) rotate(0deg)",
          transition: "transform .3s cubic-bezier(.34,1.56,.64,1)",
          filter: hov ? `drop-shadow(0 6px 12px ${accentHex}55)` : "none",
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Colored glow bg on hover */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        width: 80, height: 80, borderRadius: "9999px",
        background: `radial-gradient(circle, ${accentHex}25, transparent 70%)`,
        opacity: hov ? 1 : 0,
        transition: "opacity .3s ease",
        pointerEvents: "none",
      }} aria-hidden="true" />

      <p className="relative z-10 text-sm font-bold transition-colors duration-200"
        style={{ color: hov ? accentHex : darkMode ? "#f8fafc" : "#1e293b" }}>
        {title}
      </p>
      <p className={`relative z-10 mt-1 text-xs leading-snug ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{description}</p>

      <div className="relative z-10 mt-3 flex items-center justify-between">
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{
            background: hov ? `${accentHex}22` : darkMode ? "rgba(30,41,59,0.8)" : "#f1f5f9",
            color: hov ? accentHex : darkMode ? "#94a3b8" : "#64748b",
            transition: "all .25s",
          }}>
          {stat}
        </span>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24, borderRadius: "9999px",
          background: hov ? accentHex : "transparent",
          transition: "background .25s ease, transform .25s ease",
          transform: hov ? "translateX(2px)" : "translateX(0)",
        }}>
          <svg className="size-3.5" style={{ color: hov ? "white" : darkMode ? "#475569" : "#cbd5e1", transition: "color .25s" }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function ProfileHeroCard({ initials, fullName, email, memberSince, darkMode = false }: { initials: string; fullName: string | null; email: string; memberSince: string; darkMode?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div className={`relative flex flex-col items-center rounded-3xl px-6 py-8 overflow-hidden transition-colors duration-200 border ${darkMode ? "bg-[#182234] border-slate-800/80 shadow-[0_8px_40px_rgba(0,0,0,.4)]" : "bg-white border-transparent shadow-[0_8px_40px_rgba(0,0,0,.1)]"
      }`}
      style={{ minHeight: 330 }}>
      <div className="absolute inset-0 pointer-events-none opacity-75">
        <ParticleNetwork />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3 w-full">
        <AnimatedAvatar initials={initials} />
        <div className="relative text-center" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <h1 className={`text-xl font-extrabold cursor-pointer hover:text-orange-500 transition-colors duration-200 ${darkMode ? "text-white" : "text-slate-900"
            }`} style={{ letterSpacing: "-0.01em" }}>
            {fullName ?? "Mi cuenta"}
          </h1>
          <p className={`text-sm cursor-pointer hover:text-teal-400 transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-400"
            }`}>{email}</p>
          <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-300"}`}>Miembro desde {memberSince}</p>

          {/* Quick hover card */}
          <div style={{
            position: "absolute", left: "50%", top: "calc(100% + 8px)", width: 210,
            transform: hov ? "translateX(-50%) scale(1)" : "translateX(-50%) scale(0.97)",
            opacity: hov ? 1 : 0, pointerEvents: hov ? "auto" : "none",
            transition: "opacity .2s,transform .2s", zIndex: 30,
          }}>
            <div className={`rounded-2xl border p-4 shadow-2xl text-left ${darkMode ? "bg-[#1e293b] border-slate-700 text-slate-200" : "bg-white border-orange-100"
              }`}>
              <div className="space-y-1">
                <Link href="/mi-cuenta" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${darkMode ? "text-orange-400 bg-orange-950/40 hover:bg-orange-900/50" : "text-orange-700 bg-orange-50 hover:bg-orange-100"
                  }`}>
                  <span>👁️</span> Ver perfil completo
                </Link>
                <Link href="/mi-cuenta/datos" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  <span>✏️</span> Editar datos
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg,#f97316,#fbbf24)", boxShadow: "0 3px 12px rgba(249,115,22,.4)" }}>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          VERIFICADO
        </div>
      </div>
    </div>
  );
}

// ─── Highlights Carousel ──────────────────────────────────────────────────────

function HighlightCard({ item, darkMode = false, cardWidth }: { item: typeof HIGHLIGHTS[0]; darkMode?: boolean; cardWidth: string }) {
  const [err, setErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div
      className={`flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer border transition-all duration-250 ${darkMode ? "border-slate-800 bg-[#182234]" : "border-transparent bg-white"
        }`}
      style={{
        width: cardWidth,
        boxShadow: hov
          ? darkMode ? "0 12px 32px rgba(0,0,0,.5)" : "0 12px 32px rgba(0,0,0,.18)"
          : darkMode ? "0 4px 14px rgba(0,0,0,.3)" : "0 2px 10px rgba(0,0,0,.08)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div className="relative h-36 sm:h-44">
        {!err
          ? <img src={item.src} alt={item.label} className="w-full h-full object-cover" onError={() => setErr(true)} loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: item.fallbackColor }}>{item.fallbackEmoji}</div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200" style={{ opacity: hov ? 1 : 0 }}>
          <div className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <svg className="size-5 text-slate-800 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div className={`px-3 py-2 ${darkMode ? "bg-[#182234]" : "bg-white"}`}>
        <p className={`text-xs font-semibold truncate ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item.label}</p>
      </div>
    </div>
  );
}

function HighlightsCarousel({ darkMode = false }: { darkMode?: boolean }) {
  const [offset, setOffset] = useState(0);
  const windowWidth = useWindowWidth();
  // Show 2 cards on small screens, 4 on larger
  const VISIBLE = windowWidth > 0 && windowWidth < 640 ? 2 : 4;
  const GAP = 12; // gap-3 = 12px
  // Card width string passed to each card
  const cardWidthPct = VISIBLE === 2 ? 50 : 25;
  const cardWidth = `calc(${cardWidthPct}% - ${GAP * (VISIBLE - 1) / VISIBLE}px)`;
  const maxOffset = Math.max(0, HIGHLIGHTS.length - VISIBLE);

  // Reset offset when VISIBLE changes to avoid overflow
  useEffect(() => {
    setOffset(o => Math.min(o, maxOffset));
  }, [VISIBLE, maxOffset]);

  const translateValue = VISIBLE === 2
    ? `calc(-${offset} * (50% + ${GAP / 2}px))`
    : `calc(-${offset} * (25% + ${GAP * 3 / 4}px))`;

  return (
    <section className="mt-6 sm:mt-8" aria-label="Interactive Highlights">
      <h2 className={`mb-3 sm:mb-4 text-center text-xs sm:text-sm font-bold tracking-widest uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        Interactive Highlights
      </h2>
      <div className="relative flex items-center gap-2">
        <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
          className={`flex-shrink-0 flex size-8 sm:size-9 items-center justify-center rounded-full border shadow-sm transition-all disabled:opacity-30 ${darkMode
              ? "border-slate-700 bg-[#1e293b] text-slate-300 hover:border-orange-500 hover:text-orange-400"
              : "border-slate-200 bg-white text-slate-500 hover:border-orange-300 hover:text-orange-500"
            }`}
          aria-label="Anterior">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-400 ease-out"
            style={{ gap: GAP, transform: `translateX(${translateValue})` }}
          >
            {HIGHLIGHTS.map(h => <HighlightCard key={h.id} item={h} darkMode={darkMode} cardWidth={cardWidth} />)}
          </div>
        </div>
        <button onClick={() => setOffset(o => Math.min(maxOffset, o + 1))} disabled={offset >= maxOffset}
          className={`flex-shrink-0 flex size-8 sm:size-9 items-center justify-center rounded-full border shadow-sm transition-all disabled:opacity-30 ${darkMode
              ? "border-slate-700 bg-[#1e293b] text-slate-300 hover:border-orange-500 hover:text-orange-400"
              : "border-slate-200 bg-white text-slate-500 hover:border-orange-300 hover:text-orange-500"
            }`}
          aria-label="Siguiente">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}

// ─── Mis Momentos ─────────────────────────────────────────────────────────────

function MisMomentos({ darkMode = false }: { darkMode?: boolean }) {
  const [active, setActive] = useState(0);
  const [errs, setErrs] = useState<Record<number, boolean>>({});
  const setErr = (id: number) => setErrs(e => ({ ...e, [id]: true }));
  const m = MOMENTS[active];
  return (
    <section className={`rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${darkMode ? "bg-[#182234] border-slate-800" : "bg-white border-slate-100"
      }`} aria-label="Mis Momentos">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🎞️</span>
        <h2 className={`text-sm font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Mis Momentos</h2>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${darkMode ? "bg-orange-950/60 text-orange-400" : "bg-orange-100 text-orange-600"
          }`}>{MOMENTS.length} clips</span>
      </div>
      <div className="relative h-40 overflow-hidden rounded-xl" key={active}
        style={{ background: `linear-gradient(135deg,${m.gradFrom},${m.gradTo})` }}>
        {!errs[m.id]
          ? <img src={m.src} alt={m.label} className="w-full h-full object-cover" onError={() => setErr(m.id)} style={{ animation: "hpBounce .35s ease-out" }} />
          : <div className="w-full h-full flex items-center justify-center text-center text-white select-none" style={{ animation: "hpBounce .35s ease-out" }}>
            <div><div className="text-5xl mb-1">{m.emoji}</div><p className="text-sm font-bold">{m.label}</p></div>
          </div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-xl">
            <svg className="size-5 text-orange-500 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {MOMENTS.map((mo, i) => (
          <button key={mo.id} onClick={() => setActive(i)} aria-label={mo.label}
            className="flex-1 overflow-hidden rounded-lg transition-all duration-200"
            style={{ height: 52, outline: active === i ? "2.5px solid #f97316" : "2.5px solid transparent", outlineOffset: 2, transform: active === i ? "scale(1.05)" : "scale(1)" }}>
            {!errs[mo.id]
              ? <img src={mo.src} alt={mo.label} className="w-full h-full object-cover" onError={() => setErr(mo.id)} loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: `linear-gradient(135deg,${mo.gradFrom},${mo.gradTo})` }}>{mo.emoji}</div>
            }
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Receta Semanal ───────────────────────────────────────────────────────────

function RecetaSemanal({ darkMode = false }: { darkMode?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  return (
    <section className={`rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${darkMode ? "bg-[#182234] border-slate-800" : "bg-white border-slate-100"
      }`} aria-label="Receta Semanal">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">👨‍🍳</span>
        <h2 className={`text-sm font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Receta Semanal</h2>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${darkMode ? "bg-teal-950/60 text-teal-300" : "bg-teal-100 text-teal-600"
          }`}>Nuevo</span>
      </div>
      <div className="relative h-40 overflow-hidden rounded-xl cursor-pointer"
        style={{ background: "linear-gradient(135deg,#134e4a,#0f766e)" }}
        onClick={() => setPlaying(p => !p)} role="button"
        aria-label={playing ? "Pausar" : "Reproducir"}>
        {!imgErr && <img src={RECIPE_IMG} alt="Receta" className="absolute inset-0 w-full h-full object-cover" onError={() => setImgErr(true)} style={{ opacity: playing ? .5 : .7, transition: "opacity .3s" }} />}
        <div className="absolute inset-0 flex items-end justify-center gap-0.5 px-8 pb-3 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="rounded-full bg-white/60 w-1"
              style={{ height: `${16 + Math.sin(i * .8) * 10}px`, animation: playing ? `hpWave ${.4 + (i % 5) * .1}s ease-in-out infinite alternate` : "none" }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-xl hover:scale-110 transition-transform">
            {playing
              ? <svg className="size-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              : <svg className="size-5 text-teal-600 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            }
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>Ingredientes en tienda →</p>
        <div className="flex flex-wrap gap-1.5">
          {INGREDIENTS.map(ing => (
            <Link key={ing.name} href={ing.href}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${darkMode
                  ? "border-teal-800/60 bg-teal-950/50 text-teal-300 hover:bg-teal-900/60 hover:border-teal-500"
                  : "border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 hover:scale-105"
                }`}>
              <span>{ing.icon}</span>{ing.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Badge Card ───────────────────────────────────────────────────────────────

function BadgeCard({ badge, darkMode = false }: { badge: typeof BADGES[0]; darkMode?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="relative flex flex-col items-center gap-1.5 rounded-xl p-3 cursor-pointer"
      style={{ background: hov && badge.unlocked ? `radial-gradient(circle at 50% 0%,${badge.glowColor},transparent 70%)` : undefined, transform: hov ? "translateY(-4px)" : "translateY(0)", transition: "transform .2s ease" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      role="article" aria-label={`Logro: ${badge.title}`}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
        background: badge.unlocked ? `linear-gradient(135deg,${badge.gradFrom},${badge.gradTo})` : darkMode ? "#334155" : "#e2e8f0",
        boxShadow: badge.unlocked && hov ? `0 8px 24px ${badge.glowColor}` : undefined,
        filter: badge.unlocked ? "none" : "grayscale(1) opacity(0.35)",
        transform: hov && badge.unlocked ? "scale(1.14) rotate(-4deg)" : "scale(1) rotate(0deg)",
        transition: "transform .2s,box-shadow .2s",
      }}>
        {badge.emoji}
        {badge.unlocked && (
          <div style={{
            position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "9999px", background: "white",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#f97316", boxShadow: "0 1px 4px rgba(0,0,0,.15)"
          }}>✓</div>
        )}
      </div>
      <p className="text-[9px] font-bold text-center leading-tight" style={{ color: badge.unlocked ? darkMode ? "#e2e8f0" : "#1e293b" : "#64748b" }}>{badge.title}</p>
      {hov && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", zIndex: 30, width: 160,
          background: darkMode ? "#020617" : "#0f172a", borderRadius: 12, padding: "10px 12px", textAlign: "center",
          animation: "hpFadeUp .15s ease-out", pointerEvents: "none", boxShadow: "0 8px 24px rgba(0,0,0,.5)",
          border: darkMode ? "1px solid #334155" : "none"
        }} role="tooltip">
          <p style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{badge.title}</p>
          <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{badge.desc}</p>
          {!badge.unlocked && <p style={{ fontSize: 9, color: "#fbbf24", marginTop: 4, fontWeight: 600 }}>🔒 Bloqueado</p>}
        </div>
      )}
    </div>
  );
}

// ─── Logros Banner ────────────────────────────────────────────────────────────

function LogrosBanner({ darkMode = false }: { darkMode?: boolean }) {
  const unlocked = BADGES.filter(b => b.unlocked).length;
  const pct = Math.round((unlocked / BADGES.length) * 100);
  return (
    <section className={`mt-4 rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${darkMode ? "bg-[#182234] border-slate-800" : "bg-white border-slate-100"
      }`} aria-label="Logros de Usuario">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🏆</span>
        <h2 className={`text-sm font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Logros de Usuario</h2>
        <span className={`ml-auto text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{unlocked} / {BADGES.length} desbloqueados</span>
      </div>
      <div className={`mb-4 h-2 overflow-hidden rounded-full ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f97316,#fbbf24)", transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
        {BADGES.map(b => <BadgeCard key={b.id} badge={b} darkMode={darkMode} />)}
      </div>
    </section>
  );
}

// ─── SVG strings for side cards ───────────────────────────────────────────────

const SVG_BOX = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><rect x="15" y="25" width="50" height="38" rx="4" fill="#fed7aa" stroke="#f97316" stroke-width="2"/><rect x="20" y="20" width="40" height="10" rx="3" fill="#fb923c" stroke="#f97316" stroke-width="1.5"/><path d="M30 25 Q40 18 50 25" stroke="#f97316" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 38 L52 38M28 45 L45 45" stroke="#f97316" stroke-width="2" stroke-linecap="round" opacity="0.5"/></svg>`;
const SVG_USER = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><circle cx="40" cy="28" r="16" fill="#99f6e4" stroke="#14b8a6" stroke-width="2"/><circle cx="40" cy="25" r="8" fill="#14b8a6"/><path d="M16 64 C16 50 64 50 64 64" fill="#99f6e4" stroke="#14b8a6" stroke-width="2"/></svg>`;
const SVG_HEART = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><path d="M40 58 C40 58 14 42 14 26 C14 18 20 12 28 12 C33 12 37 15 40 19 C43 15 47 12 52 12 C60 12 66 18 66 26 C66 42 40 58 40 58Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2"/><path d="M40 52 C40 52 20 38 20 26 C20 21 24 17 28 17 C32 17 36 20 40 25 C44 20 48 17 52 17 C56 17 60 21 60 26 C60 38 40 52 40 52Z" fill="#fb7185"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><rect x="22" y="36" width="36" height="28" rx="5" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/><path d="M28 36 V26 C28 18 52 18 52 26 V36" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="40" cy="50" r="5" fill="#f59e0b"/><rect x="38" y="50" width="4" height="7" rx="2" fill="#f59e0b"/></svg>`;

const LEFT_CARDS = [
  { href: "/mi-cuenta/pedidos", title: "Mis pedidos", description: "Seguí el estado de tus compras y revisá el historial completo", stat: "3 activos", accentHex: "#f97316", svgContent: SVG_BOX },
  { href: "/mi-cuenta/datos", title: "Mis datos", description: "Actualizá tu nombre, teléfono y dirección de entrega", stat: "Perfil 100%", accentHex: "#14b8a6", svgContent: SVG_USER },
];
const RIGHT_CARDS = [
  { href: "/mi-cuenta/favoritos", title: "Favoritos", description: "Los productos que guardaste para comprar después", stat: "12 guardados", accentHex: "#f43f5e", svgContent: SVG_HEART },
  { href: "/mi-cuenta/seguridad", title: "Seguridad", description: "Cambiá tu contraseña y configurá opciones de acceso", stat: "Cuenta segura", accentHex: "#f59e0b", svgContent: SVG_LOCK },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePageClient({ initials, fullName, email, memberSince }: ProfilePageClientProps) {
  useProfileStyles();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("hipermaxi_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("hipermaxi_theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 -mt-6 -mb-12 py-6 sm:py-8 ${darkMode ? "bg-[#0b0f19] text-slate-100" : "bg-[#f9f8f6] text-slate-800"}`}>
      <main id="main-content" className="mx-auto max-w-6xl px-3 sm:px-4" style={{ animation: "hpSlide .4s ease-out" }}>

        {/* ══ TOP BAR WITH DARK MODE TOGGLE ══ */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-full ${darkMode ? "bg-orange-400 shadow-[0_0_8px_#f97316]" : "bg-orange-500"}`} />
            <span className={`text-xs font-bold tracking-wider uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Mi Perfil Hipermaxi
            </span>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 ${darkMode
                ? "border-slate-700 bg-[#1e293b] text-amber-300 hover:border-amber-400/50 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? (
              <>
                <span className="text-sm">☀️</span> Modo Claro
              </>
            ) : (
              <>
                <span className="text-sm">🌙</span> Modo Oscuro
              </>
            )}
          </button>
        </div>

        {/*
          ══ 3-col layout:
            • Mobile  (< lg): single column, hero card FIRST via CSS order
            • Desktop (≥ lg): 3 columns — left cards | hero | right cards
        */}
        <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[1fr_1.7fr_1fr]">
          {/* Hero — order-first on mobile so it appears at top */}
          <div className="lg:order-2 lg:col-start-2">
            <ProfileHeroCard initials={initials} fullName={fullName} email={email} memberSince={memberSince} darkMode={darkMode} />
          </div>
          {/* Left side cards — stack below hero on mobile, left col on desktop */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:grid sm:grid-cols-2 lg:flex lg:flex-col lg:order-1 lg:col-start-1 lg:row-start-1">
            {LEFT_CARDS.map(c => <SideCard key={c.href} {...c} darkMode={darkMode} />)}
          </div>
          {/* Right side cards — after left on mobile, right col on desktop */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:grid sm:grid-cols-2 lg:flex lg:flex-col lg:order-3 lg:col-start-3 lg:row-start-1">
            {RIGHT_CARDS.map(c => <SideCard key={c.href} {...c} darkMode={darkMode} />)}
          </div>
        </div>

        {/* Highlights carousel */}
        <HighlightsCarousel darkMode={darkMode} />

        {/* Momentos + Receta */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <MisMomentos darkMode={darkMode} />
          <RecetaSemanal darkMode={darkMode} />
        </div>

        {/* Logros */}
        <LogrosBanner darkMode={darkMode} />

        {/* Logout */}
        <div className={`mt-6 border-t pt-5 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <form action={logout}>
            <button type="submit"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${darkMode
                  ? "border-slate-800 bg-[#1e293b]/60 text-slate-400 hover:border-red-800/80 hover:bg-red-950/40 hover:text-red-400"
                  : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                }`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
