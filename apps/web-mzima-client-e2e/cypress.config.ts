import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { ENVS } from './src/utils/env.utils';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    baseUrl: ENVS.dev,
    viewportWidth: 1440,
    viewportHeight: 900,
  },
});
