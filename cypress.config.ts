// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';
import { ENVS } from './apps/web-mzima-client-e2e/src/utils/env.utils';

export default defineConfig({
  e2e: {
    baseUrl: ENVS.dev,
    viewportWidth: 1920,
    viewportHeight: 1200,

    setupNodeEvents(on, config) {
      // don't remove, this is for debug in CI
      console.log(`\nBaseUrl is: ${config.baseUrl}\n`);

      // @ts-ignore
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.isHeadless) {
          launchOptions.args.push('--window-size=1920,1200');
          return launchOptions;
        }
      });
    },
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
