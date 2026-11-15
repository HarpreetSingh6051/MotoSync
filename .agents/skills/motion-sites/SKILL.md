---
name: motion-sites
description: >-
  Use this skill when designing, reviewing, or implementing award-winning motion websites,
  cinematic scroll-driven narratives (scrollytelling), smooth inertia scrolling (Lenis),
  3D WebGL viewport transitions, and Awwwards-tier micro-interactions inspired by MotionSites AI (https://motionsites.ai/).
---

# MotionSites AI · Award-Winning Motion & Scrollytelling Architecture

MotionSites AI represents the gold standard for high-end, award-winning web animation, fluid interactive design, and cinematic scrollytelling experiences (Awwwards, FWA, CSS Design Awards caliber).

Use this skill whenever you need to build websites that feel alive, fluid, and immersive.

---

## 1. The Core Motion Hierarchy

Every top-tier motion site is built on four foundation layers:

```
┌────────────────────────────────────────────────────────┐
│ 4. Micro-Interactions (Magnetic buttons, tilts, cursor) │
├────────────────────────────────────────────────────────┤
│ 3. Narrative Scrollytelling (Sticky stages & crossfades)│
├────────────────────────────────────────────────────────┤
│ 2. Physics & Easing (Spring dampers, cubic-bezier arcs)│
├────────────────────────────────────────────────────────┤
│ 1. Scroll Inertia (Lenis smooth virtual momentum)      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Foundation 1: Inertia & Smooth Scroll Engine (Lenis)

Standard browser scrolling is jerky and abrupt. Award-winning sites use **Lenis** to interpolate scroll delta with exponential decay:

### React / TanStack Start / Next.js Setup
```tsx
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential out
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 3. Foundation 2: Scrollytelling Sticky Stage Architecture

Instead of scrolling through generic card grids, a scrollytelling page locks the viewport on a "sticky stage" while scroll distance drives transitions:

### Architecture Blueprint
```tsx
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function CinematicStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Measure scroll progress through 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 2. Smooth spring interpolation for scrubbed values
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 3. Map progress into scene transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.35], [1, 0.85]);

  const scene2Opacity = useTransform(smoothProgress, [0.3, 0.45, 0.65], [0, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.3, 0.45], [100, 0]);

  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.8, 1], [0, 1, 1]);
  const scene3Scale = useTransform(smoothProgress, [0.65, 1], [0.9, 1]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Scene 1 */}
        <motion.div
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <h2 className="text-6xl font-black">ACT I: THE IGNITION</h2>
        </motion.div>

        {/* Scene 2 */}
        <motion.div
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <h2 className="text-6xl font-black">ACT II: THE FORMATION</h2>
        </motion.div>

        {/* Scene 3 */}
        <motion.div
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <h2 className="text-6xl font-black">ACT III: THE APEX</h2>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 4. Foundation 3: Motion Curves & Easing Tokens

Never use linear or generic `ease` transitions. Standardize on these cinema curves:

| Token Name | CSS Value | Framer Motion Transition | Best For |
| :--- | :--- | :--- | :--- |
| **`--ease-cinema`** | `cubic-bezier(0.16, 1, 0.3, 1)` | `[0.16, 1, 0.3, 1]` | Hero entrances, large modals, scene transitions |
| **`--ease-swift`** | `cubic-bezier(0.25, 1, 0.5, 1)` | `[0.25, 1, 0.5, 1]` | Fast button hovers, dropdowns, icon flips |
| **`--ease-dramatic`**| `cubic-bezier(0.7, 0, 0.2, 1)` | `[0.7, 0, 0.2, 1]` | Curtain reveals, page wipes, shutter effects |
| **`--spring-tactile`**| N/A | `{ type: "spring", stiffness: 180, damping: 20 }` | Magnetic buttons, toggle pills, drag snap |

---

## 5. Foundation 4: WebGL / 3D Canvas Scroll Synchronization

When rendering 3D models (Three.js / WebGL), sync the camera and mesh rotation directly to document scroll progress:

```tsx
// Inside requestAnimationFrame loop:
camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
modelGroup.rotation.y = THREE.MathUtils.lerp(
  modelGroup.rotation.y,
  scrollProgress * Math.PI * 2,
  0.08
);
```

---

## 6. Review Checklist for High-End Motion

Before certifying a screen or interaction as complete:
- [ ] **Frame Budget:** Maintains locked 60+ FPS without jank or dropped frames during scroll.
- [ ] **GPU Compositing:** All animating elements use `transform` and `opacity` only (never animate `top`, `left`, `width`, or `height`).
- [ ] **No Content Traps:** Text is readable at every step and does not vanish mid-scroll on mobile.
- [ ] **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected, sticky heights collapse to standard layout and animations snap immediately.
