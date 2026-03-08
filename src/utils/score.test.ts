import { describe, it, expect } from 'vitest';
import { calculateScore } from './score';

describe('calculateScore', () => {
  it('calculates base distance score (1 point per 100px)', () => {
    const result = calculateScore(500, 0, 60, 0, 0);
    expect(result.distance).toBe(5);
  });

  it('rounds down fractional distance', () => {
    const result = calculateScore(299, 0, 60, 0, 0);
    expect(result.distance).toBe(2);
  });

  it('gives max time bonus at exactly par time', () => {
    const result = calculateScore(0, 60, 60, 0, 0);
    expect(result.timeBonus).toBe(500);
  });

  it('reduces time bonus by 10 per second over par', () => {
    const result = calculateScore(0, 65, 60, 0, 0);
    expect(result.timeBonus).toBe(450);
  });

  it('floors time bonus at 0', () => {
    const result = calculateScore(0, 200, 60, 0, 0);
    expect(result.timeBonus).toBe(0);
  });

  it('gives full time bonus when under par', () => {
    const result = calculateScore(0, 30, 60, 0, 0);
    expect(result.timeBonus).toBe(500);
  });

  it('calculates life bonus at 200 per life', () => {
    const result = calculateScore(0, 0, 60, 3, 0);
    expect(result.lifeBonus).toBe(600);
  });

  it('gives zero life bonus for zero lives', () => {
    const result = calculateScore(0, 0, 60, 0, 0);
    expect(result.lifeBonus).toBe(0);
  });

  it('calculates power-up bonus at 50 per pickup', () => {
    const result = calculateScore(0, 0, 60, 0, 4);
    expect(result.powerUpBonus).toBe(200);
  });

  it('sums all components into total', () => {
    // 8000px = 80 distance, par time = 500 time bonus, 3 lives = 600, 2 power-ups = 100
    const result = calculateScore(8000, 60, 60, 3, 2);
    expect(result.total).toBe(80 + 500 + 600 + 100);
    expect(result.total).toBe(1280);
  });

  it('handles edge case of negative lives gracefully', () => {
    const result = calculateScore(0, 0, 60, -1, 0);
    expect(result.lifeBonus).toBe(0);
  });
});
