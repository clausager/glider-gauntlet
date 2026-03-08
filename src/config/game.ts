export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PHYSICS = {
  playerMaxSpeed: 300,
  playerAcceleration: 600,
  playerDeceleration: 400,
  playerRotationLean: 15, // degrees of lean toward movement
};

export const GAMEPLAY = {
  startingLives: 3,
  maxLives: 5,
  invulnerabilityDuration: 1000, // ms
  checkpointsPerLevel: 3,
};

export const SCORING = {
  distancePointsPer100px: 1,
  timeBonusMax: 500,
  timePenaltyPerSecond: 10,
  lifeBonusPerLife: 200,
  powerUpBonus: 50,
};
