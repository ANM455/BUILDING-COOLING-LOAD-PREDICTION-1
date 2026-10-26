import test from 'node:test';
import assert from 'node:assert/strict';
import {
  predictLoads,
  getEnergyClass,
  generateSensitivitySweep,
  BUILDING_PRESETS,
  type BuildingFeatures,
} from './mlEngine';

test('predictLoads computes realistic bounds for standard presets', () => {
  const ecoPreset = BUILDING_PRESETS.find(p => p.id === 'eco_villa')!;
  const ecoResult = predictLoads(ecoPreset.features, 'random_forest');

  // Eco villa with height 3.5m and low glazing should have low cooling load
  assert.ok(ecoResult.coolingLoad >= 10.0, 'Cooling load must be >= 10.0 kWh/m²');
  assert.ok(ecoResult.coolingLoad <= 20.0, 'Eco villa cooling load should be low (<= 20.0)');
  assert.equal(ecoResult.energyClass.grade === 'A+' || ecoResult.energyClass.grade === 'A', true);
  assert.ok(ecoResult.chillerTons > 0, 'Chiller tons must be positive');
  assert.ok(ecoResult.peakCoolingKw > 0, 'Peak kW must be positive');
});

test('predictLoads demonstrates higher cooling load for tall glazed building', () => {
  const ecoFeatures = BUILDING_PRESETS.find(p => p.id === 'eco_villa')!.features;
  const glassFeatures = BUILDING_PRESETS.find(p => p.id === 'commercial_tower')!.features;

  const ecoResult = predictLoads(ecoFeatures);
  const glassResult = predictLoads(glassFeatures);

  assert.ok(
    glassResult.coolingLoad > ecoResult.coolingLoad,
    `Commercial tower cooling (${glassResult.coolingLoad}) should exceed eco villa (${ecoResult.coolingLoad})`
  );
  assert.ok(glassResult.coolingLoad >= 25.0, 'Tall glazed building should have high cooling load');
});

test('predictLoads supports multiple regression models (random forest, gradient boosting, ridge)', () => {
  const features: BuildingFeatures = {
    relativeCompactness: 0.76,
    surfaceArea: 661.5,
    wallArea: 343.0,
    roofArea: 159.25,
    overallHeight: 7.0,
    orientation: 3,
    glazingArea: 0.25,
    glazingAreaDistribution: 1,
  };

  const rf = predictLoads(features, 'random_forest');
  const gb = predictLoads(features, 'gradient_boosting');
  const ridge = predictLoads(features, 'ridge_regression');

  assert.ok(rf.coolingLoad > 15 && rf.coolingLoad < 45, 'RF in reasonable range');
  assert.ok(gb.coolingLoad > 15 && gb.coolingLoad < 45, 'GB in reasonable range');
  assert.ok(ridge.coolingLoad > 15 && ridge.coolingLoad < 45, 'Ridge in reasonable range');
});

test('getEnergyClass assigns correct grades', () => {
  assert.equal(getEnergyClass(14.5).grade, 'A+');
  assert.equal(getEnergyClass(20.0).grade, 'A');
  assert.equal(getEnergyClass(28.0).grade, 'B');
  assert.equal(getEnergyClass(34.0).grade, 'C');
  assert.equal(getEnergyClass(44.0).grade, 'D');
});

test('generateSensitivitySweep creates valid monotonic trend for glazingArea', () => {
  const base: BuildingFeatures = {
    relativeCompactness: 0.76,
    surfaceArea: 661.5,
    wallArea: 343.0,
    roofArea: 159.25,
    overallHeight: 7.0,
    orientation: 3,
    glazingArea: 0.25,
    glazingAreaDistribution: 1,
  };

  const sweep = generateSensitivitySweep(base, 'glazingArea', 10);
  assert.equal(sweep.length, 10);

  // Check that increasing glazingArea leads to higher cooling load
  const first = sweep[0];
  const last = sweep[sweep.length - 1];
  assert.ok(first.value < last.value, 'First glazing value should be smaller than last');
  assert.ok(
    last.coolingLoad > first.coolingLoad,
    `Cooling load at max glazing (${last.coolingLoad}) should be higher than at min glazing (${first.coolingLoad})`
  );
});
