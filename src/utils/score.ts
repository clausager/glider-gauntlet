import { SCORING } from '@/config/game';

export interface ScoreBreakdown {
  distance: number;
  timeBonus: number;
  lifeBonus: number;
  powerUpBonus: number;
  total: number;
}

export function calculateScore(
  distancePx: number,
  elapsedSeconds: number,
  parTimeSeconds: number,
  remainingLives: number,
  collectedPowerUps: number,
): ScoreBreakdown {
  const distance = Math.floor(distancePx / 100) * SCORING.distancePointsPer100px;

  const overPar = Math.max(0, elapsedSeconds - parTimeSeconds);
  const timeBonus = Math.max(0, SCORING.timeBonusMax - overPar * SCORING.timePenaltyPerSecond);

  const lifeBonus = Math.max(0, remainingLives) * SCORING.lifeBonusPerLife;

  const powerUpBonus = collectedPowerUps * SCORING.powerUpBonus;

  return {
    distance,
    timeBonus,
    lifeBonus,
    powerUpBonus,
    total: distance + timeBonus + lifeBonus + powerUpBonus,
  };
}
