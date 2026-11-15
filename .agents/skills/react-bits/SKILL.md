---
name: react-bits
description: >-
  Use this skill when designing or implementing animated UI components, 3D card carousels,
  interactive text animations, atmospheric WebGL backgrounds, and micro-interactions
  inspired by React Bits (https://reactbits.dev/).
---

# React Bits Component & Animation Engine

React Bits is an open-source library of animated, customizable React components built with **Tailwind CSS**, **Framer Motion**, and **Three.js**.

Use this skill whenever you need to build smooth, modern, tactile web interfaces with high visual polish, fluid physics, and interactive 3D elements.

---

## 1. Core Component Directory

### A. 3D Elements & Carousels
1. **CurvedCarousel / RollingGallery:**
   - 3D cylindrical carousel that curves items along the Y-axis using `transform: rotateY(...) translateZ(...)`.
   - Supports dragging, momentum decay, touch swiping, and dynamic perspective depth.
2. **DomeGallery:**
   - Spherical 3D dome array of cards/images arranged on a geodesic sphere with mouse-look camera rotation.
3. **TiltedCard / SpotlightCard:**
   - Interactive card that tracks pointer position to calculate realistic 3D pitch/roll (`rotateX`, `rotateY`) and overlays a specular radial gradient sheen.
4. **PixelCard / GlitchCard:**
   - Canvas/SVG pixelated hover reveal or glitch scanline effect on mouse hover.
5. **FlowingMenu:**
   - Marquee-style flowing vertical/horizontal menu with smooth spring velocity.

### B. Text Animations
1. **SplitText:**
   - Splits headings by letter or word, animating each character with staggered spring delay (`staggerChildren: 0.04s`, `y: "100%" -> "0%"`).
2. **ShinyText:**
   - Animated shimmer gradient sweeping across text (`linear-gradient(110deg, ...)`).
3. **BlurText:**
   - Text that fades in from a heavy blur (`filter: blur(12px) -> blur(0px)`).
4. **DecryptedText:**
   - Hacker/cyberpunk text decoding effect cycling through random glyphs before settling on the actual word.
5. **TrueFocus / VariableProximity:**
   - Typography that scales, bolds, or sharpens based on cursor proximity distance.

### C. Atmospheric Backgrounds
1. **Iridescence:**
   - Three.js fragment shader generating fluid, oil-slick, colorful chromatic waves.
2. **Aurora:**
   - Gentle, organic Northern Lights glowing radial gradients with multi-octave swaying animation.
3. **Hyperspeed:**
   - Three.js starfield warp tunnel with camera zoom and trailing neon lines.
4. **Particles / DotGrid:**
   - Interactive canvas particle net connecting nearby nodes with proximity lines.
5. **FaultyTerminal:**
   - Retro CRT monitor scanlines with subtle flicker and barrel distortion.

### D. Animations & Micro-Interactions
1. **Magnetic:**
   - Magnet button/icon that gently pulls toward the user's cursor (`x`, `y` spring pull up to 25px).
2. **SplashCursor / BlobCursor:**
   - Fluid particle or gooey blob following the cursor with trailing easing.
3. **StarBorder:**
   - Glowing gradient line orbiting the perimeter of a button or card border.
4. **ClickSpark:**
   - Burst of particle sparks emitting from mouse click coordinates.

---

## 2. Production Recipes & Code Templates

### Recipe 1: Spotlight 3D Tilt Card
```tsx
import React, { useRef, useState } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(125, 224, 226, 0.18)"
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
    setOpacity(1);

    // Calculate 3D tilt angles (-10deg to +10deg)
    const normX = (x / rect.width - 0.5) * 16;
    const normY = -(y / rect.height - 0.5) * 16;
    setTilt({ x: normY, y: normX });
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-8 transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d"
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

### Recipe 2: Magnetic Button
```tsx
import React, { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function MagneticButton({
  children,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      onClick={onClick}
      className={`inline-block cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

### Recipe 3: Animated Shiny Text
```tsx
export function ShinyText({
  text,
  className = "",
  speed = 4
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#93a7b0,45%,#ffffff,55%,#93a7b0)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shine ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
```
*(With CSS: `@keyframes shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`)*

---

## 3. Recommended Performance Guidelines

1. **Hardware Acceleration:** Always apply `transform-style: preserve-3d;` and `will-change: transform;` on elements with mouse-tracking tilt or rotational physics.
2. **Responsive Fallbacks:** On mobile viewports (<768px), disable heavy 3D perspective transforms or fallback to smooth touch swipe.
3. **Respect Reduced Motion:** Wrap animations in `@media (prefers-reduced-motion: reduce)` to disable continuous loops and replace springs with instant state changes.
