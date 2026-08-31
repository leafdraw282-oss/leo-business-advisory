import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Phase 4-F — generic scroll-reveal hook, shared by every major public
 * section (see e.g. src/sections/Impact.jsx) and by ImagePlaceholder's own
 * opt-in image reveal (its `revealMotion` prop). Progressive enhancement by
 * construction: `supportsReveal` (computed once, synchronously, during the
 * very first render — never inside an effect) decides whether this
 * instance ever hides its content at all. It's false — content fully
 * visible, no hidden state, matching every existing caller's appearance
 * before this phase — whenever IntersectionObserver doesn't exist or the
 * visitor has asked for reduced motion, so a JS error, an unsupported
 * browser, or this hook simply never getting a chance to run its effect
 * can never leave content invisible.
 *
 * When it IS supported, the very first render already returns the hidden
 * 'reveal' className (no separate mount-time transition into hidden, so
 * there's never a flash-of-visible-then-hidden frame either). The effect's
 * only job is setting up the IntersectionObserver and revealing the node
 * on its first intersection — never re-hiding on scroll back up, and
 * disconnecting immediately after. A fallback timer guarantees reveal even
 * if the observer callback is somehow never invoked (e.g. an unrelated
 * layout bug keeps the node from ever intersecting).
 *
 * The actual reveal MAGNITUDE (distance/duration, and the total on/off
 * switch for motion_level="minimal" / image_motion_style="none") is
 * decided entirely by CSS reading the data-motion-level/data-image-motion
 * attributes applyDesignSettings() sets on <html> — see global.css. This
 * hook never needs to know the current admin-configured value itself.
 */
function computeSupportsReveal() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return false;
  try {
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function useReveal() {
  const ref = useRef(null);
  const [supportsReveal] = useState(computeSupportsReveal);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!supportsReveal) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    let settled = false;
    const reveal = () => {
      if (settled) return;
      settled = true;
      setVisible(true);
    };

    let observer;
    try {
      // Phase 6-B — threshold 0.15/-10% meant an element had to already be
      // noticeably inside the viewport before triggering, which read as an
      // abrupt "it just snaps on" start rather than a continuous entrance.
      // Lowered so the reveal starts as an element is still mostly below
      // the fold and finishes settling right around when it's comfortably
      // in view — still a one-shot trigger (never re-hidden, observer
      // still disconnects immediately below), just timed to feel
      // continuous with the scroll instead of catching up to it.
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
      );
      observer.observe(node);
    } catch {
      // A constructor/observe failure must never leave content hidden.
      reveal();
    }

    // Phase 6-A — was 1500ms, sized back when this hook only ever ran ONE
    // instance per section (mounted, at most, a couple viewports below the
    // fold). Extending it to a per-LIST-ITEM instance (every Case Study,
    // every Career entry — all mounted immediately on page load, per
    // Contact.jsx's own comment: "every section is mounted immediately, no
    // route-based lazy loading") turned this safety net into an accidental
    // normal-path trigger: any item a visitor hadn't scrolled to within
    // 1.5s of PAGE LOAD (not "of scrolling near it") silently flipped to
    // reveal--visible off-screen, defeating the whole point of giving each
    // item its own scroll-triggered entrance — verified via direct
    // computed-opacity checks during this phase's own QA. 6s keeps this a
    // true "IntersectionObserver never fired at all" safety net (a real
    // bug elsewhere, not a matter of scroll speed) while giving normal
    // browsing — reading Hero, then scrolling at an ordinary pace — room
    // to reach a sixth Case Study or Career entry on its own, on-scroll
    // trigger, the way the rest of this hook is designed to work.
    const fallback = window.setTimeout(reveal, 6000);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallback);
    };
  }, [supportsReveal]);

  if (!supportsReveal) return { ref, className: '' };
  return { ref, className: visible ? 'reveal reveal--visible' : 'reveal' };
}
