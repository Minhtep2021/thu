import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSafeDodgePosition,
  computeTooltipShiftX,
  getDodgeTooltip,
  getYesButtonBoost,
  inflateRect,
  rectsOverlap,
  type RectBounds,
} from './dodgePhysics';

test('rectsOverlap detects overlapping and separated rectangles accurately', () => {
  const a: RectBounds = { x: 100, y: 100, width: 80, height: 44 };
  const bOverlap: RectBounds = { x: 150, y: 120, width: 80, height: 44 };
  const bClear: RectBounds = { x: 250, y: 100, width: 80, height: 44 };

  assert.equal(rectsOverlap(a, bOverlap, 0), true);
  assert.equal(rectsOverlap(a, bClear, 0), false);
  assert.equal(rectsOverlap(a, bClear, 75), true);
});

test('computeSafeDodgePosition stays strictly inside desktop viewport and avoids Yes button', () => {
  const viewport = { width: 1440, height: 900 };
  const noButtonSize = { width: 96, height: 44 };
  const yesButtonRect: RectBounds = { x: 600, y: 520, width: 140, height: 52 };
  const musicToggleRect: RectBounds = { x: 1360, y: 20, width: 56, height: 56 };

  for (let i = 0; i < 40; i++) {
    const pos = computeSafeDodgePosition({
      viewport,
      noButtonSize,
      yesButtonRect,
      exclusionRects: [musicToggleRect],
      margin: 20,
      yesBuffer: 28,
    });

    assert.ok(pos.x >= 20, `x=${pos.x} should be >= 20`);
    assert.ok(pos.x + noButtonSize.width <= viewport.width - 20, `right edge should stay inside`);
    assert.ok(pos.y >= 56, `y=${pos.y} should leave room for tooltip`);
    assert.ok(pos.y + noButtonSize.height <= viewport.height - 20, `bottom edge should stay inside`);

    const noRect: RectBounds = {
      x: pos.x,
      y: pos.y,
      width: noButtonSize.width,
      height: noButtonSize.height,
    };
    assert.equal(rectsOverlap(noRect, yesButtonRect, 28), false);
    assert.equal(rectsOverlap(noRect, musicToggleRect, 16), false);
  }
});

test('computeSafeDodgePosition avoids Yes button even on compact mobile 390x844 viewport', () => {
  const viewport = { width: 390, height: 844 };
  const noButtonSize = { width: 92, height: 44 };
  const yesButtonRect: RectBounds = { x: 80, y: 520, width: 160, height: 54 };

  let prev = { x: 250, y: 525 };
  for (let i = 0; i < 25; i++) {
    const pos = computeSafeDodgePosition({
      viewport,
      noButtonSize,
      yesButtonRect,
      currentNoPos: prev,
    });

    assert.ok(pos.x >= 20 && pos.x + noButtonSize.width <= viewport.width - 20);
    assert.ok(pos.y >= 56 && pos.y + noButtonSize.height <= viewport.height - 20);
    assert.equal(
      rectsOverlap(
        { x: pos.x, y: pos.y, width: noButtonSize.width, height: noButtonSize.height },
        yesButtonRect,
        28
      ),
      false
    );
    prev = pos;
  }
});

test('getDodgeTooltip cycles through configured messages', () => {
  const tips = ['Đố cậu bắt được tui', 'Cậu còn sự lựa chọn khác màaaa🥺🥺🥺'] as const;
  assert.equal(getDodgeTooltip(0, tips), null);
  assert.equal(getDodgeTooltip(1, tips), tips[0]);
  assert.equal(getDodgeTooltip(2, tips), tips[1]);
  assert.equal(getDodgeTooltip(3, tips), tips[0]);
  assert.equal(getDodgeTooltip(4, tips), tips[1]);
});

test('getYesButtonBoost scales and brightens progressively with cap', () => {
  const b0 = getYesButtonBoost(0);
  const b3 = getYesButtonBoost(3);
  const b15 = getYesButtonBoost(15);

  assert.equal(b0.scale, 1);
  assert.ok(b3.scale > b0.scale);
  assert.ok(b3.glowLevel > b0.glowLevel);
  assert.equal(b15.scale, getYesButtonBoost(10).scale);
});

test('inflateRect expands bounds to shield text and tooltip space', () => {
  const base: RectBounds = { x: 200, y: 200, width: 300, height: 80 };
  const inflated = inflateRect(base, 80, 48, 20);
  assert.deepEqual(inflated, { x: 120, y: 152, width: 460, height: 148 });
});

test('computeTooltipShiftX keeps wide tooltips inside narrow viewports', () => {
  // Button near left edge on 390px phone, tooltip 240px wide
  const leftShift = computeTooltipShiftX(50, 240, 390, 12);
  assert.ok(50 + leftShift - 120 >= 12);

  // Button near right edge on 390px phone, tooltip 240px wide
  const rightShift = computeTooltipShiftX(340, 240, 390, 12);
  assert.ok(340 + rightShift + 120 <= 390 - 12);

  // Button centered in 1440px desktop needs zero shift
  assert.equal(computeTooltipShiftX(720, 240, 1440, 12), 0);
});
