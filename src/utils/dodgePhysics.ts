export interface RectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface DodgeCalculationInput {
  viewport: ViewportSize;
  noButtonSize: { width: number; height: number };
  yesButtonRect: RectBounds;
  currentNoPos?: { x: number; y: number } | null;
  exclusionRects?: RectBounds[];
  margin?: number;
  yesBuffer?: number;
  randomFn?: () => number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Returns true if two axis-aligned rectangles intersect (with optional padding around rectB).
 */
export function rectsOverlap(a: RectBounds, b: RectBounds, padding = 0): boolean {
  return (
    a.x < b.x + b.width + padding &&
    a.x + a.width > b.x - padding &&
    a.y < b.y + b.height + padding &&
    a.y + a.height > b.y - padding
  );
}

/**
 * Computes a new safe (x, y) viewport position for the dodging "No" button.
 * - Keeps the entire button (plus tooltip clearance on top) inside visible screen bounds.
 * - Never overlaps the "Yes" button (including a generous safety buffer).
 * - Avoids extra exclusion zones (such as the top-right music control).
 * - Ensures a noticeable jump distance from the button's previous position when space permits.
 */
export function computeSafeDodgePosition({
  viewport,
  noButtonSize,
  yesButtonRect,
  currentNoPos = null,
  exclusionRects = [],
  margin = 20,
  yesBuffer = 28,
  randomFn = Math.random,
}: DodgeCalculationInput): Point {
  const topTooltipClearance = 56;
  const minX = margin;
  const minY = Math.max(margin, topTooltipClearance);
  const maxX = Math.max(minX, viewport.width - noButtonSize.width - margin);
  const maxY = Math.max(minY, viewport.height - noButtonSize.height - margin);

  const rangeX = Math.max(0, maxX - minX);
  const rangeY = Math.max(0, maxY - minY);

  const isCandidateValid = (x: number, y: number, minDistanceFromCurrent: number): boolean => {
    const candidateRect: RectBounds = {
      x,
      y,
      width: noButtonSize.width,
      height: noButtonSize.height,
    };

    if (rectsOverlap(candidateRect, yesButtonRect, yesBuffer)) {
      return false;
    }

    for (const zone of exclusionRects) {
      if (rectsOverlap(candidateRect, zone, 16)) {
        return false;
      }
    }

    if (currentNoPos && minDistanceFromCurrent > 0) {
      const dx = x - currentNoPos.x;
      const dy = y - currentNoPos.y;
      if (Math.hypot(dx, dy) < minDistanceFromCurrent) {
        return false;
      }
    }

    return true;
  };

  // Try random sampling first with strong distance preference
  const minJump = Math.min(110, Math.max(rangeX, rangeY) * 0.35);
  for (let attempt = 0; attempt < 90; attempt++) {
    const x = minX + randomFn() * rangeX;
    const y = minY + randomFn() * rangeY;
    const distanceThreshold = attempt < 60 ? minJump : 32;
    if (isCandidateValid(x, y, distanceThreshold)) {
      return { x: Math.round(x), y: Math.round(y) };
    }
  }

  // Deterministic grid fallback so we always find a valid non-overlapping spot
  const candidates: Point[] = [];
  const steps = 8;
  for (let ix = 0; ix <= steps; ix++) {
    for (let iy = 0; iy <= steps; iy++) {
      const x = minX + (rangeX * ix) / steps;
      const y = minY + (rangeY * iy) / steps;
      if (isCandidateValid(x, y, 0)) {
        candidates.push({ x: Math.round(x), y: Math.round(y) });
      }
    }
  }

  if (candidates.length > 0) {
    // Pick the candidate farthest from current position (or random among top farthest)
    if (currentNoPos) {
      candidates.sort((a, b) => {
        const distA = Math.hypot(a.x - currentNoPos.x, a.y - currentNoPos.y);
        const distB = Math.hypot(b.x - currentNoPos.x, b.y - currentNoPos.y);
        return distB - distA;
      });
      const poolSize = Math.min(4, candidates.length);
      return candidates[Math.floor(randomFn() * poolSize)];
    }
    return candidates[Math.floor(randomFn() * candidates.length)];
  }

  // Extreme narrow viewport fallback: clamp safely above or below the Yes button
  const aboveY = yesButtonRect.y - noButtonSize.height - yesBuffer;
  const belowY = yesButtonRect.y + yesButtonRect.height + yesBuffer;
  const clampedX = Math.min(maxX, Math.max(minX, Math.round(minX + rangeX * 0.5)));

  if (aboveY >= minY) {
    return { x: clampedX, y: Math.round(aboveY) };
  }
  return { x: clampedX, y: Math.min(maxY, Math.round(belowY)) };
}

/**
 * Returns a new rectangle expanded outward on each side.
 */
export function inflateRect(
  rect: RectBounds,
  padX: number,
  padTop: number,
  padBottom = padX
): RectBounds {
  return {
    x: rect.x - padX,
    y: rect.y - padTop,
    width: rect.width + padX * 2,
    height: rect.height + padTop + padBottom,
  };
}

/**
 * Keeps a wide centered tooltip above the dodging button inside horizontal viewport bounds.
 */
export function computeTooltipShiftX(
  buttonCenterX: number,
  tooltipWidth: number,
  viewportWidth: number,
  margin = 12
): number {
  const half = tooltipWidth / 2;
  const minCenter = margin + half;
  const maxCenter = Math.max(minCenter, viewportWidth - margin - half);
  const clampedCenter = Math.min(maxCenter, Math.max(minCenter, buttonCenterX));
  return Math.round(clampedCenter - buttonCenterX);
}

/**
 * Returns the visual growth multiplier and glow intensity for the "Yes ❤️" button
 * as the user keeps trying to click/hover "No".
 */
export function getYesButtonBoost(dodgeCount: number): {
  scale: number;
  glowLevel: number;
} {
  const capped = Math.max(0, Math.min(dodgeCount, 10));
  return {
    scale: Number((1 + capped * 0.065).toFixed(3)),
    glowLevel: Number((1 + capped * 0.18).toFixed(3)),
  };
}

/**
 * Cycles cleanly through the configured teasing tooltips based on dodge count (1-indexed after first dodge).
 */
export function getDodgeTooltip(dodgeCount: number, tooltips: readonly string[]): string | null {
  if (dodgeCount <= 0 || tooltips.length === 0) {
    return null;
  }
  return tooltips[(dodgeCount - 1) % tooltips.length];
}
