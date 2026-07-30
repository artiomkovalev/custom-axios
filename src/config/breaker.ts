import { type Options } from 'opossum';

export const DEFAULT_BREAKER_CONFIG: Options = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
};
